import { useCallback, useEffect, useMemo, useState } from 'react'
import { TrendingUp } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingModal from '../../components/admin/BookingModal'
import { formatCurrency, formatDateTime, getBookingDateTimeValue, getFirstValue, getStatusBadgeClass, getStatusLabel, normalizeStatus, useBookings } from '../../hooks/useBookings'

const KANBAN_COLUMNS = [
  { key: 'new', label: 'New' },
  { key: 'assigned', label: 'Driver Assigned / En Route' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'completed', label: 'Completed' }
]

const normalizeForKanban = (status) => {
  const normalized = normalizeStatus(status)
  if (normalized === 'assigned' || normalized === 'en_route') return 'assigned'
  if (normalized === 'cancelled') return 'cancelled'
  if (normalized === 'completed') return 'completed'
  return 'new'
}

export default function AdminHome() {
  const { fetchBookings, subscribeToBookings } = useBookings()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)

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

  const groupedBookings = useMemo(() => {
    return bookings.reduce((acc, booking) => {
      const bucket = normalizeForKanban(booking.status)
      if (!acc[bucket]) acc[bucket] = []
      acc[bucket].push(booking)
      return acc
    }, {})
  }, [bookings])

  const stats = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - 6)
    startOfWeek.setHours(0, 0, 0, 0)

    let todayCount = 0
    let weekCount = 0
    let totalRevenue = 0
    let activeTrips = 0

    bookings.forEach((booking) => {
      const createdAt = booking.created_at ? new Date(booking.created_at) : null
      if (createdAt && createdAt >= startOfToday) todayCount += 1
      if (createdAt && createdAt >= startOfWeek) weekCount += 1

      const normalized = normalizeStatus(booking.status)
      if (normalized === 'assigned' || normalized === 'en_route') activeTrips += 1
      if (normalized === 'completed') {
        const reservationFee = Number(
          getFirstValue(booking, ['price_amount', 'reservation_fee', 'reservationFee', 'total_price', 'total_fare'], 0)
        )
        totalRevenue += Number.isNaN(reservationFee) ? 0 : reservationFee
      }
    })

    return {
      todayCount,
      weekCount,
      totalRevenue,
      activeTrips
    }
  }, [bookings])

  const kpiCards = [
    { label: 'Total Bookings Today', value: stats.todayCount },
    { label: 'Total Bookings This Week', value: stats.weekCount },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue) },
    { label: 'Active Trips', value: stats.activeTrips }
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Live overview of bookings and revenue.</p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((card) => (
            <div key={card.label} className="rounded-lg bg-white border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{card.label}</span>
                <TrendingUp className="h-4 w-4 text-[#B35A38]" />
              </div>
              <div className="mt-3 text-2xl font-semibold text-gray-900">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {KANBAN_COLUMNS.map((column) => {
            const items = groupedBookings[column.key] || []
            return (
              <div key={column.key} className="bg-white border border-gray-200 rounded-lg flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">{column.label}</h3>
                  <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[420px]">
                  {loading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : items.length === 0 ? (
                    <div className="text-sm text-gray-400">No bookings</div>
                  ) : (
                    items.map((booking) => {
                      const bookingId = booking.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'
                      const customerName = getFirstValue(
                        booking,
                        ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name', 'profiles.full_name', 'user.full_name'],
                        'Unknown'
                      )
                      const pickup = getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation'], '—')
                      const destination = getFirstValue(
                        booking,
                        ['destination_location', 'destination', 'dropoff', 'dropoff_location'],
                        '—'
                      )
                      const dateValue = getBookingDateTimeValue(booking)
                      const dateLabel = formatDateTime(dateValue)
                      const vehicleType = getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')
                      const badgeClass = getStatusBadgeClass(booking.status)
                      const statusLabel = getStatusLabel(booking.status)

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="w-full text-left rounded-lg border border-gray-200 p-3 hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-500">{bookingId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-semibold text-gray-900">{customerName}</div>
                          <div className="mt-1 text-xs text-gray-500">
                            {pickup} → {destination}
                          </div>
                          <div className="mt-2 text-xs text-gray-500">{dateLabel}</div>
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-xs text-[#B35A38]">
                            {vehicleType}
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BookingModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={(updated) => {
          if (!updated) return
          setBookings((prev) => prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)))
          setSelectedBooking((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
        }}
        canAssignDriver
      />
    </AdminLayout>
  )
}
