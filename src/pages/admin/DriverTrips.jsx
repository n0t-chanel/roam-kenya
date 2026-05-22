import { useCallback, useEffect, useMemo, useState } from 'react'
import { MapPin, Phone, Clock, DollarSign, Activity, CheckCircle, Navigation } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { supabase } from '../../lib/supabase'
import { fetchUserProfiles, formatCurrency, formatDateTime, getFirstValue, mergeBookingsWithProfiles } from '../../hooks/useBookings'

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-700 border-green-200',
  on_trip: 'bg-amber-100 text-amber-700 border-amber-200',
  off_duty: 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function DriverTrips() {
  const { user } = useAdminAuth()
  const [driver, setDriver] = useState(null)
  const [activeAssignment, setActiveAssignment] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadDashboard = useCallback(async () => {
    if (!user?.email) return
    try {
      setLoading(true)
      setError(null)
      
      // 1. Get Driver Profile
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*, driver_performance(*)')
        .ilike('email', user.email)
        .limit(1)
        .maybeSingle()

      if (driverError) throw driverError
      
      if (!driverData) {
        // Driver profile doesn't exist for this auth email.
        setDriver(null)
        setLoading(false)
        return
      }
      
      setDriver(driverData)

      // 2. Get Active Assignment
      const { data: activeData, error: activeError } = await supabase
        .from('booking_assignments')
        .select(`
          id, assigned_at, completed_at,
          bookings (*)
        `)
        .eq('driver_id', driverData.id)
        .is('completed_at', null)
        .in('bookings.status', ['assigned', 'en_route'])
        .limit(1)
        .maybeSingle()
        
      if (activeError && activeError.code !== 'PGRST116') throw activeError
      const activeAssignmentRaw = activeData && activeData.bookings ? activeData : null

      // 3. Get Trip History
      const { data: historyData, error: historyError } = await supabase
        .from('booking_assignments')
        .select(`
          id, assigned_at, completed_at,
          bookings (*)
        `)
        .eq('driver_id', driverData.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })

      if (historyError) throw historyError
      const historyRows = historyData || []

      const bookingsToEnrich = []
      if (activeAssignmentRaw?.bookings) bookingsToEnrich.push(activeAssignmentRaw.bookings)
      historyRows.forEach((entry) => {
        if (entry.bookings) bookingsToEnrich.push(entry.bookings)
      })

      const userIds = [...new Set(bookingsToEnrich.map((booking) => booking.user_id).filter(Boolean))]
      const profiles = await fetchUserProfiles(userIds)
      const enrichedBookings = mergeBookingsWithProfiles(bookingsToEnrich, profiles)
      const bookingMap = new Map(enrichedBookings.map((booking) => [booking.id, booking]))
      const enrichBooking = (booking) => bookingMap.get(booking.id) || booking

      const enrichedActive = activeAssignmentRaw
        ? { ...activeAssignmentRaw, bookings: enrichBooking(activeAssignmentRaw.bookings) }
        : null
      const enrichedHistory = historyRows.map((entry) => ({
        ...entry,
        bookings: entry.bookings ? enrichBooking(entry.bookings) : entry.bookings
      }))

      setActiveAssignment(enrichedActive)
      setHistory(enrichedHistory)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  useEffect(() => {
    if (!driver?.id) return
    const bookingIds = new Set(
      [activeAssignment?.bookings?.id, ...history.map((item) => item.bookings?.id)].filter(Boolean)
    )
    const channel = supabase
      .channel(`driver-dashboard-${driver.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_assignments', filter: `driver_id=eq.${driver.id}` },
        () => loadDashboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'drivers', filter: `id=eq.${driver.id}` },
        () => loadDashboard()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          const bookingId = payload.new?.id || payload.old?.id
          if (bookingIds.has(bookingId)) {
            loadDashboard()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [driver?.id, activeAssignment, history, loadDashboard])

  const handleUpdateStatus = async (newStatus) => {
    if (!activeAssignment?.bookings?.id) return
    try {
      setActionLoading(true)
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', activeAssignment.bookings.id)
        
      if (updateError) throw updateError

      if (newStatus === 'completed') {
        const perf = driver.driver_performance?.[0] || {}
        const fare = Number(activeAssignment.bookings.total_fare ?? activeAssignment.bookings.total_price ?? 0)
        
        const { error: assignError } = await supabase.from('booking_assignments')
          .update({ completed_at: new Date().toISOString() })
          .eq('id', activeAssignment.id)
        if (assignError) throw assignError
          
        const { error: driverError } = await supabase.from('drivers')
          .update({ status: 'available' })
          .eq('id', driver.id)
        if (driverError) throw driverError
          
        const { error: perfError } = await supabase.from('driver_performance')
          .update({
            trips_completed: (perf.trips_completed || 0) + 1,
            earnings_total: Number(perf.earnings_total || 0) + (Number.isNaN(fare) ? 0 : fare)
          })
          .eq('driver_id', driver.id)
        if (perfError) throw perfError
      }
      
      await loadDashboard()
    } catch (err) {
      alert(`Failed to update trip: ${err.message}`)
    } finally {
      setActionLoading(false)
    }
  }

  const toggleDriverState = async () => {
    if (!driver) return
    if (driver.status === 'on_trip') {
      alert('You cannot change your state while on an active trip.')
      return
    }
    const nextStatus = driver.status === 'available' ? 'off_duty' : 'available'
    try {
      const { error } = await supabase.from('drivers').update({ status: nextStatus }).eq('id', driver.id)
      if (error) throw error
      await loadDashboard()
    } catch (err) {
      alert(err.message)
    }
  }

  const performance = driver?.driver_performance?.[0] || {}

  const activeBooking = activeAssignment?.bookings
  const activeCustomerName = activeBooking
    ? getFirstValue(activeBooking, ['customer_name', 'customerName', 'full_name', 'name'], 'Unknown')
    : 'Unknown'
  const activeCustomerPhone = activeBooking
    ? getFirstValue(activeBooking, ['customer_phone', 'customerPhone', 'phone'], '')
    : ''
  const activeCustomerEmail = activeBooking
    ? getFirstValue(activeBooking, ['customer_email', 'customerEmail', 'email'], '')
    : ''
  
  const todayEarnings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return history.reduce((sum, item) => {
      if (item.completed_at && item.completed_at.startsWith(today)) {
        const fare = Number(item.bookings?.total_fare ?? item.bookings?.total_price ?? 0)
        return sum + (Number.isNaN(fare) ? 0 : fare)
      }
      return sum
    }, 0)
  }, [history])

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Driver Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Welcome back{driver?.name ? `, ${driver.name.split(' ')[0]}` : ''}</p>
          </div>
          {driver && (
            <button
              type="button"
              onClick={toggleDriverState}
              disabled={driver.status === 'on_trip'}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors disabled:opacity-50 ${STATUS_COLORS[driver.status] || STATUS_COLORS.off_duty}`}
            >
              Status: {driver.status?.replace('_', ' ').toUpperCase()}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p className="text-gray-500 text-sm">Loading dashboard...</p>
          </div>
        ) : driver ? (
          <>
            {/* Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(todayEarnings)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(performance.earnings_total ?? 0)}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Trips Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{performance.trips_completed ?? 0}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Active Trip */}
            {activeAssignment && activeAssignment.bookings ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#B35A38] overflow-hidden">
                <div className="bg-[#B35A38] text-white px-5 py-3 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 animate-pulse" />
                    Current Active Trip
                  </h3>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-semibold tracking-wider">
                    #{activeAssignment.bookings.id.slice(0,6).toUpperCase()}
                  </span>
                </div>
                <div className="p-5 md:p-6 grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">PICKUP</p>
                        <p className="text-gray-900 font-semibold">{activeAssignment.bookings.pickup_location || 'Not specified'}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(activeAssignment.bookings.pickup_datetime)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Navigation className="h-5 w-5 text-[#B35A38] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">DESTINATION</p>
                        <p className="text-gray-900 font-semibold">{activeAssignment.bookings.destination_location || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">CUSTOMER</p>
                      <p className="text-gray-900 font-semibold">{activeCustomerName}</p>
                      {activeCustomerPhone && (
                        <a href={`tel:${activeCustomerPhone}`} className="flex items-center gap-2 text-sm text-[#B35A38] mt-1 hover:underline">
                          <Phone className="h-3 w-3" />
                          {activeCustomerPhone}
                        </a>
                      )}
                      {activeCustomerEmail && (
                        <p className="text-xs text-gray-500 mt-1">{activeCustomerEmail}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">FARE</p>
                      <p className="text-gray-900 font-bold text-lg">{formatCurrency(activeAssignment.bookings.total_fare ?? activeAssignment.bookings.total_price)}</p>
                    </div>
                    
                    <div className="pt-2 flex flex-col gap-2">
                      {activeAssignment.bookings.status === 'assigned' && (
                        <button
                          onClick={() => handleUpdateStatus('en_route')}
                          disabled={actionLoading}
                          className="w-full bg-[#B35A38] text-white font-semibold py-2.5 rounded-lg hover:bg-[#9c4c2d] transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? 'Updating...' : 'I have arrived / En Route'}
                        </button>
                      )}
                      {(activeAssignment.bookings.status === 'assigned' || activeAssignment.bookings.status === 'en_route') && (
                        <button
                          onClick={() => handleUpdateStatus('completed')}
                          disabled={actionLoading}
                          className="w-full bg-green-600 text-white font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? 'Updating...' : 'Mark Trip as Completed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center">
                <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Active Trips</h3>
                <p className="text-gray-500 mt-1 max-w-sm">You currently don't have any trips assigned to you. Relax or switch your status to Available to receive new assignments.</p>
              </div>
            )}

            {/* History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Recent Trips</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Route</th>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3 text-right">Fare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-5 py-8 text-center text-gray-400">
                          You haven't completed any trips yet.
                        </td>
                      </tr>
                    ) : (
                      history.map((item) => {
                        const booking = item.bookings || {}
                        return (
                          <tr key={item.id} className="bg-white border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                              {formatDateTime(item.completed_at || booking.pickup_datetime).split(',')[0]}
                            </td>
                            <td className="px-5 py-3">
                              <div className="max-w-[200px] truncate text-gray-900">{booking.pickup_location}</div>
                              <div className="max-w-[200px] truncate text-gray-500 text-xs">→ {booking.destination_location}</div>
                            </td>
                            <td className="px-5 py-3">
                              {getFirstValue(booking, ['customer_name', 'customerName', 'full_name', 'name'], '—')}
                            </td>
                            <td className="px-5 py-3 text-right font-medium text-gray-900">
                              {formatCurrency(booking.total_fare ?? booking.total_price)}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto mt-10">
            <div className="bg-amber-50 h-16 w-16 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Driver Profile Missing</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Your account is successfully logged in as a driver, but we couldn't find a matching driver profile in the system for your email address (<strong>{user?.email}</strong>).
            </p>
            <div className="mt-6 bg-gray-50 p-4 rounded-lg w-full text-sm text-gray-700">
              <p className="font-semibold mb-1">What to do next:</p>
              <p>Please contact your system administrator and ask them to add you to the <strong>Drivers List</strong> using this exact email address.</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
