import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import BookingModal from '../../components/admin/BookingModal'
import DriverAssignmentModal from '../../components/admin/DriverAssignmentModal'
import { bookingStatusUpdateEmail } from '../../lib/emailTemplates'
import { sendEmail } from '../../lib/resendClient'
import { supabase } from '../../lib/supabase'
import { useAdminAuth } from '../../context/AdminAuthContext'
import {
  formatDateTime,
  getBookingDateTimeValue,
  getFirstValue,
  getStatusBadgeClass,
  getStatusLabel,
  normalizeStatus,
  useBookings
} from '../../hooks/useBookings'

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Assigned', value: 'assigned' },
  { label: 'En Route', value: 'en_route' },
  { label: 'Completed', value: 'completed' }
]

export default function AgentHome() {
  const { user } = useAdminAuth()
  const { updateBookingStatus, subscribeToBookings } = useBookings()
  const [adminId, setAdminId] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [assignmentBooking, setAssignmentBooking] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)

  const loadAdminId = useCallback(async () => {
    if (!user?.id) return
    const { data, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (adminError) {
      setError(adminError.message)
      return
    }
    setAdminId(data?.id || null)
  }, [user])

  const loadAssignments = useCallback(async () => {
    if (!adminId) return
    try {
      setError(null)
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('booking_assignments')
        .select(
          `
          id,
          booking_id,
          driver_id,
          agent_id,
          assigned_at,
          completed_at,
          bookings (*),
          drivers (name, phone, email, vehicle_type, vehicle_plate)
        `
        )
        .eq('agent_id', adminId)
        .order('assigned_at', { ascending: false })

      if (queryError) throw queryError
      setAssignments(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [adminId])

  useEffect(() => {
    loadAdminId()
  }, [loadAdminId])

  useEffect(() => {
    if (!adminId) return
    loadAssignments()
    const unsubscribe = subscribeToBookings(() => loadAssignments())
    return () => unsubscribe()
  }, [adminId, loadAssignments, subscribeToBookings])

  const bookings = useMemo(
    () =>
      assignments
        .map((assignment) => ({
          ...assignment.bookings,
          assignment
        }))
        .filter(Boolean),
    [assignments]
  )

  const filtered = useMemo(() => {
    if (filter === 'all') return bookings
    return bookings.filter((booking) => normalizeStatus(booking.status) === filter)
  }, [bookings, filter])

  const activeCount = useMemo(
    () => bookings.filter((booking) => ['new', 'assigned', 'en_route'].includes(normalizeStatus(booking.status))).length,
    [bookings]
  )

  const handleStatusUpdate = async (booking, status) => {
    try {
      setActionMessage(null)
      const updated = await updateBookingStatus(booking.id, status)
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.booking_id === updated.id
            ? { ...assignment, bookings: { ...assignment.bookings, ...updated } }
            : assignment
        )
      )
      const bookingIdShort = booking.id?.slice(0, 6)?.toUpperCase() || booking.id
      const customerEmail = getFirstValue(booking, ['customer_email', 'customerEmail', 'email'], '')
      if (customerEmail) {
        try {
          const template = bookingStatusUpdateEmail({
            customerName: getFirstValue(booking, ['customer_name', 'customerName', 'full_name', 'name'], 'Customer'),
            status,
            pickupLocation: getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation'], '—'),
            destination: getFirstValue(booking, ['destination_location', 'destination', 'dropoff', 'dropoff_location'], '—'),
            pickupDatetime: formatDateTime(getBookingDateTimeValue(booking)),
            bookingId: bookingIdShort
          })
          await sendEmail({ to: customerEmail, subject: template.subject, html: template.html })
        } catch (emailErr) {
          setActionMessage({ type: 'warning', message: 'Status updated, but email notification failed.' })
        }
      } else {
        setActionMessage({ type: 'warning', message: 'Status updated, but customer email is missing.' })
      }
    } catch (err) {
      setActionMessage({ type: 'error', message: err.message })
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Booking Queue</h2>
            <p className="text-sm text-gray-500 mt-1">
              Active bookings assigned to you{' '}
              <span className="ml-2 inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-[#B35A38]">
                {activeCount}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={loadAssignments}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                filter === item.value ? 'bg-[#B35A38] text-white' : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {actionMessage && (
          <p
            className={`text-sm ${
              actionMessage.type === 'error'
                ? 'text-red-600'
                : actionMessage.type === 'warning'
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {actionMessage.message}
          </p>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading bookings...</div>
          ) : filtered.length === 0 ? (
            <div className="text-sm text-gray-500">No bookings found for this filter.</div>
          ) : (
            filtered.map((booking) => {
              const statusLabel = getStatusLabel(booking.status)
              const statusClass = getStatusBadgeClass(booking.status)
              const bookingId = booking.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'
              const customerName = getFirstValue(
                booking,
                ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name'],
                'Customer'
              )
              const customerPhone = getFirstValue(booking, ['customer_phone', 'customerPhone', 'phone'], '')
              const pickup = getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation'], '—')
              const destination = getFirstValue(booking, ['destination_location', 'destination', 'dropoff', 'dropoff_location'], '—')
              const dateLabel = formatDateTime(getBookingDateTimeValue(booking))
              const vehicleType = getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')
              const normalizedStatus = normalizeStatus(booking.status)

              return (
                <div key={booking.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{bookingId}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {customerName}{' '}
                      {customerPhone && (
                        <a href={`tel:${customerPhone}`} className="text-[#B35A38] ml-2">
                          {customerPhone}
                        </a>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {pickup} → {destination}
                    </div>
                    <div className="text-xs text-gray-500">{dateLabel}</div>
                    <div className="text-xs text-gray-500">Vehicle: {vehicleType}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {normalizedStatus === 'new' && (
                      <button
                        type="button"
                        onClick={() => setAssignmentBooking(booking)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Assign Driver
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedBooking(booking)}
                      className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      View Details
                    </button>
                    {normalizedStatus === 'assigned' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(booking, 'en_route')}
                        className="rounded-md bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                      >
                        Mark En Route
                      </button>
                    )}
                    {normalizedStatus === 'en_route' && (
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(booking, 'completed')}
                        className="rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      <BookingModal
        booking={selectedBooking}
        isOpen={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
        onStatusChange={(updated) => {
          if (!updated) return
          setAssignments((prev) =>
            prev.map((assignment) =>
              assignment.booking_id === updated.id
                ? { ...assignment, bookings: { ...assignment.bookings, ...updated } }
                : assignment
            )
          )
        }}
        canAssignDriver={false}
      />

      <DriverAssignmentModal
        booking={assignmentBooking}
        isOpen={Boolean(assignmentBooking)}
        onClose={() => setAssignmentBooking(null)}
        onAssigned={(result) => {
          if (!result?.booking) return
          setAssignments((prev) =>
            prev.map((assignment) =>
              assignment.booking_id === result.booking.id
                ? { ...assignment, bookings: { ...assignment.bookings, ...result.booking } }
                : assignment
            )
          )
        }}
      />
    </AdminLayout>
  )
}
