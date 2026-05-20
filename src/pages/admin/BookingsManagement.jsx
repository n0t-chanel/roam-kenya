import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingModal from '../../components/admin/BookingModal'
import { exportToCSV } from '../../lib/exportUtils'
import {
  formatDateTime,
  getBookingDateTimeValue,
  getFirstValue,
  getStatusBadgeClass,
  getStatusLabel,
  normalizeStatus,
  useBookings
} from '../../hooks/useBookings'

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'En Route', value: 'en_route' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const SERVICE_KEYS = ['service_type', 'service_category', 'serviceType', 'serviceCategory']

const resolveServiceType = (booking) =>
  getFirstValue(booking, SERVICE_KEYS, '').toString().trim()

const resolveCustomerName = (booking) =>
  getFirstValue(booking, ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name'], 'Unknown')

const resolveCustomerPhone = (booking) =>
  getFirstValue(booking, ['customer_phone', 'customerPhone', 'phone'], '')

const resolveCustomerEmail = (booking) =>
  getFirstValue(booking, ['customer_email', 'customerEmail', 'email'], '')

const resolveVehicle = (booking) =>
  getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')

const resolveBookingId = (booking) => (booking?.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—')

const getSortValue = (booking, key) => {
  switch (key) {
    case 'id':
      return booking?.id || ''
    case 'customer':
      return resolveCustomerName(booking)
    case 'service':
      return resolveServiceType(booking)
    case 'datetime':
      return getBookingDateTimeValue(booking) || ''
    case 'status':
      return normalizeStatus(booking?.status)
    case 'vehicle':
      return resolveVehicle(booking)
    default:
      return ''
  }
}

const buildExportRows = (rows) =>
  rows.map((booking) => ({
    booking_id: booking.id,
    customer_name: resolveCustomerName(booking),
    customer_email: resolveCustomerEmail(booking),
    customer_phone: resolveCustomerPhone(booking),
    service_type: resolveServiceType(booking),
    pickup_datetime: formatDateTime(getBookingDateTimeValue(booking)),
    status: getStatusLabel(booking.status),
    vehicle_type: resolveVehicle(booking)
  }))

export default function BookingsManagement() {
  const { fetchBookings, subscribeToBookings } = useBookings()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    serviceType: '',
    search: ''
  })
  const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'desc' })

  const loadBookings = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await fetchBookings()
      setBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [fetchBookings])

  useEffect(() => {
    loadBookings()
    const unsubscribe = subscribeToBookings(() => loadBookings())
    return () => unsubscribe()
  }, [loadBookings, subscribeToBookings])

  const serviceOptions = useMemo(() => {
    const values = new Set()
    bookings.forEach((booking) => {
      const service = resolveServiceType(booking)
      if (service) values.add(service)
    })
    return Array.from(values).sort()
  }, [bookings])

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const normalizedStatus = normalizeStatus(booking.status)
      if (filters.status !== 'all' && normalizedStatus !== filters.status) return false

      const bookingDateValue = getBookingDateTimeValue(booking)
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom)
        fromDate.setHours(0, 0, 0, 0)
        if (!bookingDateValue || new Date(bookingDateValue) < fromDate) return false
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo)
        toDate.setHours(23, 59, 59, 999)
        if (!bookingDateValue || new Date(bookingDateValue) > toDate) return false
      }

      if (filters.serviceType && resolveServiceType(booking) !== filters.serviceType) return false

      if (filters.search) {
        const haystack = [
          booking.id,
          resolveCustomerName(booking),
          resolveCustomerPhone(booking)
        ]
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(filters.search.toLowerCase())) return false
      }

      return true
    })
  }, [bookings, filters])

  const sortedBookings = useMemo(() => {
    const sorted = [...filteredBookings]
    sorted.sort((a, b) => {
      const aValue = getSortValue(a, sortConfig.key)
      const bValue = getSortValue(b, sortConfig.key)
      if (aValue === bValue) return 0
      const comparison = aValue > bValue ? 1 : -1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
    return sorted
  }, [filteredBookings, sortConfig])

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      }
      return { key, direction: 'asc' }
    })
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (sortedBookings.length === 0) return
    setSelectedIds((prev) => {
      const allSelected = sortedBookings.every((booking) => prev.has(booking.id))
      if (allSelected) return new Set()
      return new Set(sortedBookings.map((booking) => booking.id))
    })
  }

  const resetFilters = () => {
    setFilters({ status: 'all', dateFrom: '', dateTo: '', serviceType: '', search: '' })
  }

  const exportRows = (rows) => {
    const dateStamp = new Date().toISOString().split('T')[0]
    exportToCSV(buildExportRows(rows), `roam-bookings-${dateStamp}.csv`)
  }

  const selectedRows = sortedBookings.filter((booking) => selectedIds.has(booking.id))

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">Search and manage customer bookings.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <label className="text-xs font-semibold text-gray-500">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">From</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.dateFrom}
                onChange={(event) => setFilters((prev) => ({ ...prev, dateFrom: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">To</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.dateTo}
                onChange={(event) => setFilters((prev) => ({ ...prev, dateTo: event.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Service Type</label>
              <select
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={filters.serviceType}
                onChange={(event) => setFilters((prev) => ({ ...prev, serviceType: event.target.value }))}
              >
                <option value="">All</option>
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Search</label>
              <input
                type="text"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="ID, name, phone"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Reset Filters
            </button>
            {selectedRows.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => exportRows(selectedRows)}
                  className="rounded-md bg-[#B35A38] px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  Export Selected to CSV
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => exportRows(sortedBookings)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Export Filtered to CSV
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={sortedBookings.length > 0 && sortedBookings.every((b) => selectedIds.has(b.id))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('id')} className="font-semibold">
                      Booking ID
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('customer')} className="font-semibold">
                      Customer
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('service')} className="font-semibold">
                      Service
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('datetime')} className="font-semibold">
                      Date/Time
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('status')} className="font-semibold">
                      Status
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button type="button" onClick={() => toggleSort('vehicle')} className="font-semibold">
                      Vehicle
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                      Loading bookings...
                    </td>
                  </tr>
                ) : sortedBookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-400">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  sortedBookings.map((booking) => {
                    const statusClass = getStatusBadgeClass(booking.status)
                    const statusLabel = getStatusLabel(booking.status)
                    return (
                      <tr key={booking.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(booking.id)}
                            onChange={() => toggleSelect(booking.id)}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">{resolveBookingId(booking)}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{resolveCustomerName(booking)}</div>
                          <div className="text-xs text-gray-500">{resolveCustomerPhone(booking) || resolveCustomerEmail(booking)}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{resolveServiceType(booking) || '—'}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateTime(getBookingDateTimeValue(booking))}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{resolveVehicle(booking)}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(booking)}
                            className="text-sm font-semibold text-[#B35A38] hover:underline"
                          >
                            View Details
                          </button>
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

      <BookingModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={(updated) => {
          if (!updated) return
          setBookings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        }}
      />
    </AdminLayout>
  )
}
