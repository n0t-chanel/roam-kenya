import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { fetchUserProfiles, formatCurrency, mergeBookingsWithProfiles } from '../../hooks/useBookings'

const STATUS_TABS = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'On Trip', value: 'on_trip' },
  { label: 'Off Duty', value: 'off_duty' }
]

const VEHICLE_TYPES = ['Sedan', 'SUV', 'Van', 'Minibus', 'Bus']

const STATUS_BADGES = {
  available: 'bg-green-100 text-green-700',
  on_trip: 'bg-amber-100 text-amber-700',
  off_duty: 'bg-gray-100 text-gray-600'
}

const normalizePhone = (value) => value.replace(/\s+/g, '')

const isValidPhone = (value) => /^\+?\d{7,15}$/.test(normalizePhone(value))

const getDriverPerformance = (driver) => driver.driver_performance?.[0] || {}

export default function DriversManagement() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' })
  const [modalState, setModalState] = useState({ type: null, driver: null })
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    vehicle_type: VEHICLE_TYPES[0],
    vehicle_plate: ''
  })
  const [formError, setFormError] = useState(null)
  const [tripHistory, setTripHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const loadDrivers = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
       const { data, error: queryError } = await supabase
         .from('drivers')
         .select(`
           *,
           driver_performance (*),
           booking_assignments (
             id, assigned_at, completed_at,
             bookings ( * )
           )
         `)
         .order('created_at', { ascending: false })

       if (queryError) throw queryError
       const driverRows = data || []
       const bookingRows = driverRows.flatMap((driver) =>
         (driver.booking_assignments || []).map((assignment) => assignment.bookings).filter(Boolean)
       )
       const userIds = [...new Set(bookingRows.map((booking) => booking.user_id).filter(Boolean))]
       const profiles = await fetchUserProfiles(userIds)
       const enrichedBookings = mergeBookingsWithProfiles(bookingRows, profiles)
       const bookingMap = new Map(enrichedBookings.map((booking) => [booking.id, booking]))

       const enrichedDrivers = driverRows.map((driver) => ({
         ...driver,
         booking_assignments: (driver.booking_assignments || []).map((assignment) => ({
           ...assignment,
           bookings: assignment.bookings
             ? bookingMap.get(assignment.bookings.id) || assignment.bookings
             : assignment.bookings
         }))
       }))

       setDrivers(enrichedDrivers)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDrivers()
  }, [loadDrivers])

  const filteredDrivers = useMemo(() => {
    if (statusFilter === 'all') return drivers
    return drivers.filter((driver) => driver.status === statusFilter)
  }, [drivers, statusFilter])

  const sortedDrivers = useMemo(() => {
    const sorted = [...filteredDrivers]
    sorted.sort((a, b) => {
      const aPerf = getDriverPerformance(a)
      const bPerf = getDriverPerformance(b)
      const aValue =
        sortConfig.key === 'trips'
          ? aPerf.trips_completed || 0
          : sortConfig.key === 'status'
          ? a.status || ''
          : a.name || ''
      const bValue =
        sortConfig.key === 'trips'
          ? bPerf.trips_completed || 0
          : sortConfig.key === 'status'
          ? b.status || ''
          : b.name || ''
      if (aValue === bValue) return 0
      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredDrivers, sortConfig])

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const openModal = (type, driver = null) => {
    setFormError(null)
    setModalState({ type, driver })
    if (driver) {
      setFormState({
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        vehicle_type: driver.vehicle_type || VEHICLE_TYPES[0],
        vehicle_plate: driver.vehicle_plate || ''
      })
    } else {
      setFormState({
        name: '',
        phone: '',
        email: '',
        vehicle_type: VEHICLE_TYPES[0],
        vehicle_plate: ''
      })
    }
  }

  const closeModal = () => {
    setModalState({ type: null, driver: null })
    setTripHistory([])
  }

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const saveDriver = async () => {
    const payload = {
      name: formState.name.trim(),
      phone: normalizePhone(formState.phone),
      email: formState.email.trim(),
      vehicle_type: formState.vehicle_type,
      vehicle_plate: formState.vehicle_plate.trim()
    }

    if (!payload.name || !payload.phone || !payload.email || !payload.vehicle_type || !payload.vehicle_plate) {
      setFormError('All fields are required.')
      return
    }

    if (!isValidPhone(payload.phone)) {
      setFormError('Phone number format is invalid.')
      return
    }

    try {
      setFormError(null)
      if (modalState.type === 'edit' && modalState.driver) {
        const { error: updateError } = await supabase
          .from('drivers')
          .update(payload)
          .eq('id', modalState.driver.id)
        if (updateError) throw updateError
      } else {
        const { data: created, error: insertError } = await supabase
          .from('drivers')
          .insert(payload)
          .select()
          .single()
        if (insertError) throw insertError

        const { error: perfError } = await supabase
          .from('driver_performance')
          .insert({ driver_id: created.id })
        if (perfError) throw perfError
      }

      await loadDrivers()
      closeModal()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const setDriverStatus = async (driver, newStatus) => {
    if (!newStatus || driver.status === newStatus) return
    const { error: updateError } = await supabase.from('drivers').update({ status: newStatus }).eq('id', driver.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    loadDrivers()
  }

  const deleteDriver = async (driver) => {
    const confirmed = window.confirm(`Delete ${driver.name}? This cannot be undone.`)
    if (!confirmed) return
    const { error: deleteError } = await supabase.from('drivers').delete().eq('id', driver.id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    loadDrivers()
  }

  const openTripHistory = async (driver) => {
    setModalState({ type: 'history', driver })
    setHistoryLoading(true)
    try {
      const { data, error: historyError } = await supabase
        .from('booking_assignments')
        .select('id, assigned_at, completed_at, bookings (*)')
        .eq('driver_id', driver.id)
        .order('assigned_at', { ascending: false })

      if (historyError) throw historyError
      setTripHistory(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setHistoryLoading(false)
    }
  }

  const totalTrips = drivers.length

  const historyTotals = useMemo(() => {
    let earnings = 0
    tripHistory.forEach((entry) => {
      const booking = entry.bookings || {}
      const fare = Number(booking.total_fare ?? booking.total_price ?? 0)
      earnings += Number.isNaN(fare) ? 0 : fare
    })
    return {
      count: tripHistory.length,
      earnings
    }
  }, [tripHistory])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Drivers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total drivers{' '}
              <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                {totalTrips}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal('add')}
            className="inline-flex items-center gap-2 rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Driver
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                statusFilter === tab.value ? 'bg-[#B35A38] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('name')} className="font-semibold">
                      Name
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Phone</th>
                  <th className="px-4 py-3 text-left">Vehicle Type</th>
                  <th className="px-4 py-3 text-left">Plate</th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('status')} className="font-semibold">
                      Status
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Active Trip</th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('trips')} className="font-semibold">
                      Trips Completed
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Earnings (Total)</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-6 text-center text-gray-500">
                      Loading drivers...
                    </td>
                  </tr>
                ) : sortedDrivers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-6 text-center text-gray-400">
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  sortedDrivers.map((driver) => {
                    const performance = getDriverPerformance(driver)
                    const activeAssignment = driver.booking_assignments?.find(a => 
                      !a.completed_at && 
                      (a.bookings?.status === 'assigned' || a.bookings?.status === 'en_route')
                    )
                    const activeBooking = activeAssignment?.bookings

                    return (
                      <tr key={driver.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-semibold text-gray-900">{driver.name}</td>
                        <td className="px-4 py-3 text-gray-600">{driver.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{driver.vehicle_type}</td>
                        <td className="px-4 py-3 text-gray-600">{driver.vehicle_plate}</td>
                        <td className="px-4 py-3">
                          <select
                            className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none cursor-pointer border border-transparent hover:border-gray-300 ${STATUS_BADGES[driver.status] || 'bg-gray-100 text-gray-600'}`}
                            value={driver.status || 'off_duty'}
                            onChange={(e) => setDriverStatus(driver, e.target.value)}
                          >
                            <option value="available" className="bg-white text-gray-900">Available</option>
                            <option value="on_trip" className="bg-white text-gray-900">On Trip</option>
                            <option value="off_duty" className="bg-white text-gray-900">Off Duty</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {activeBooking ? (
                            <div className="text-xs">
                              <span className="font-semibold text-[#B35A38]">#{activeBooking.id.slice(0,6).toUpperCase()}</span>
                              <div className="text-gray-600 mt-0.5">
                                <span className="text-gray-500 truncate max-w-[120px] inline-block" title={activeBooking.destination || activeBooking.destination_location}>
                                  To: {activeBooking.destination || activeBooking.destination_location || '—'}
                                </span>
                              </div>
                              <div className="mt-2 pt-1 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-900">{activeBooking.customer_name || 'Unknown Customer'}</p>
                                {activeBooking.customer_phone && (
                                  <a href={`tel:${activeBooking.customer_phone}`} className="text-xs text-[#B35A38] hover:underline flex items-center gap-1 mt-0.5">
                                    📞 {activeBooking.customer_phone}
                                  </a>
                                )}
                              </div>
                              <div className="mt-1.5 text-xs text-[#B35A38] font-medium flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[#B35A38] animate-pulse"></span>
                                {activeBooking.status?.replace('_', ' ').toUpperCase()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{performance.trips_completed ?? 0}</td>
                        <td className="px-4 py-3 text-gray-600">{formatCurrency(performance.earnings_total ?? 0)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openModal('edit', driver)}
                              className="text-xs font-semibold text-[#B35A38] hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => openTripHistory(driver)}
                              className="text-xs font-semibold text-gray-600 hover:underline"
                            >
                              View Trips
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteDriver(driver)}
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modalState.type === 'add' || modalState.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalState.type === 'edit' ? 'Edit Driver' : 'Add Driver'}
              </h2>
              <button type="button" onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Phone</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.phone}
                  onChange={(event) => handleFormChange('phone', event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Vehicle Type</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.vehicle_type}
                  onChange={(event) => handleFormChange('vehicle_type', event.target.value)}
                >
                  {VEHICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Vehicle Plate</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.vehicle_plate}
                  onChange={(event) => handleFormChange('vehicle_plate', event.target.value)}
                />
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveDriver}
                className="rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'history' && modalState.driver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Trip History</h2>
                <p className="text-sm text-gray-500">{modalState.driver.name}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-4 text-sm text-gray-600 flex items-center justify-between">
              <span>Total Trips: {historyTotals.count}</span>
              <span>Total Earnings: {formatCurrency(historyTotals.earnings)}</span>
            </div>
            <div className="px-6 pb-6">
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Booking ID</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Pickup</th>
                      <th className="px-4 py-3 text-left">Destination</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Fare</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                          Loading trips...
                        </td>
                      </tr>
                    ) : tripHistory.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                          No trips found.
                        </td>
                      </tr>
                    ) : (
                      tripHistory.map((entry) => {
                        const booking = entry.bookings || {}
                        return (
                          <tr key={entry.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {booking.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{booking.customer_name || booking.customerName || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{booking.pickup_location || booking.pickup || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">{booking.destination || booking.destination_location || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {booking.pickup_datetime || booking.booking_date || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">
                              {formatCurrency(booking.total_fare ?? booking.total_price ?? 0)}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{booking.status || '—'}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
