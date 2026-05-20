import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import DriverAssignmentModal from './DriverAssignmentModal'
import { useBookings, formatCurrency, formatDateTime, getBookingDateTimeValue, getFirstValue, getStatusBadgeClass, getStatusLabel } from '../../hooks/useBookings'

export default function BookingModal({ booking, isOpen, onClose, onStatusChange, canAssignDriver = false }) {
  const { updateBookingStatus } = useBookings()
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [assignmentOpen, setAssignmentOpen] = useState(false)

  const bookingId = booking?.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'
  const customerName = getFirstValue(booking, ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name'], 'Unknown')
  const customerEmail = getFirstValue(booking, ['customer_email', 'customerEmail', 'email'], '—')
  const customerPhone = getFirstValue(booking, ['customer_phone', 'customerPhone', 'phone'], '—')
  const pickupLocation = getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation', 'pickup_address'], '—')
  const destination = getFirstValue(booking, ['destination_location', 'destination', 'dropoff', 'dropoff_location'], '—')
  const vehicleType = getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')
  const statusLabel = getStatusLabel(booking?.status)
  const statusClass = getStatusBadgeClass(booking?.status)
  const totalFare = formatCurrency(getFirstValue(booking, ['total_fare', 'total_price', 'totalFare'], null))
  const reservationFee = formatCurrency(getFirstValue(booking, ['reservation_fee', 'reservationFee'], null))
  const finalPayment = formatCurrency(getFirstValue(booking, ['final_payment_due', 'finalPaymentDue'], null))
  const driverName = getFirstValue(booking, ['driver_name', 'assigned_driver_name', 'driver.full_name', 'driver.name'], 'Unassigned')
  const agentName = getFirstValue(booking, ['agent_name', 'assigned_agent_name', 'agent.full_name', 'agent.name'], 'Unassigned')

  const pickupDateTime = useMemo(() => {
    const value = getBookingDateTimeValue(booking)
    return formatDateTime(value)
  }, [booking])

  const handleStatusUpdate = async (newStatus) => {
    if (!booking?.id) return
    setError(null)
    setActionLoading(newStatus)
    try {
      const updated = await updateBookingStatus(booking.id, newStatus)
      if (onStatusChange) onStatusChange(updated)
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
  }

  const confirmCancel = async () => {
    const confirmed = window.confirm('Cancel this booking? This action cannot be undone.')
    if (!confirmed) return
    await handleStatusUpdate('cancelled')
  }

  if (!isOpen || !booking) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Booking Details</h2>
            <p className="text-sm text-gray-500">{bookingId}</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Journey Details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Pickup</p>
                <p className="text-sm text-gray-900">{pickupLocation}</p>
                <p className="text-xs text-gray-500 mt-2">Pickup Date/Time</p>
                <p className="text-sm text-gray-900">{pickupDateTime}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm text-gray-900">{destination}</p>
                <p className="text-xs text-gray-500 mt-2">Vehicle Type</p>
                <p className="text-sm text-gray-900">{vehicleType}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Info</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <p>{customerName}</p>
              <p>{customerEmail}</p>
              {customerPhone !== '—' ? (
                <a className="text-[#B35A38] hover:underline" href={`tel:${customerPhone}`}>
                  {customerPhone}
                </a>
              ) : (
                <p>{customerPhone}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Total Trip Fare</span>
                <span>{totalFare}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reservation Fee Paid (30%)</span>
                <span>{reservationFee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Final Payment Due</span>
                <span>{finalPayment}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status & Assignment</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-gray-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500">Driver</span>
                <p className="text-sm text-gray-900">{driverName}</p>
              </div>
              <div>
                <span className="text-xs uppercase text-gray-500">Agent</span>
                <p className="text-sm text-gray-900">{agentName}</p>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {canAssignDriver && (
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                onClick={() => setAssignmentOpen(true)}
              >
                Assign Driver
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleStatusUpdate('completed')}
              disabled={actionLoading === 'completed'}
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              {actionLoading === 'completed' ? 'Updating...' : 'Mark as Completed'}
            </button>
            <button
              type="button"
              onClick={confirmCancel}
              disabled={actionLoading === 'cancelled'}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {actionLoading === 'cancelled' ? 'Cancelling...' : 'Cancel Booking'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <DriverAssignmentModal
        booking={booking}
        isOpen={assignmentOpen}
        onClose={() => setAssignmentOpen(false)}
        onAssigned={(result) => {
          if (result?.booking && onStatusChange) {
            onStatusChange(result.booking)
          }
        }}
      />
    </div>
  )
}
