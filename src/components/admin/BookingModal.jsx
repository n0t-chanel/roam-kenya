import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import DriverAssignmentModal from './DriverAssignmentModal'
import { useBookings, formatCurrency, formatDateTime, getBookingDateTimeValue, getFirstValue, getStatusBadgeClass, getStatusLabel } from '../../hooks/useBookings'

export default function BookingModal({ booking, isOpen, onClose, onStatusChange, canAssignDriver = false }) {
  const { updateBookingStatus, updateBookingQuote, confirmCashPayment } = useBookings()
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [assignmentOpen, setAssignmentOpen] = useState(false)
  const [quoteAmountKes, setQuoteAmountKes] = useState('')

  const bookingId = booking?.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'
  const customerName = getFirstValue(booking, ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name', 'profiles.full_name', 'user.full_name'], 'Unknown')
  const customerEmail = getFirstValue(booking, ['customer_email', 'customerEmail', 'email', 'profiles.email', 'user.email'], '—')
  const customerPhone = getFirstValue(booking, ['customer_phone', 'customerPhone', 'phone', 'profiles.phone', 'user.phone'], '—')
  const pickupLocation = getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation', 'pickup_address'], '—')
  const destination = getFirstValue(booking, ['destination_location', 'destination', 'dropoff', 'dropoff_location'], '—')
  const vehicleType = getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')
  const statusLabel = getStatusLabel(booking?.status)
  const statusClass = getStatusBadgeClass(booking?.status)
  const totalFareCents = getFirstValue(booking, ['total_fare', 'total_price', 'totalFare'], null)
  const reservationFeeCents = getFirstValue(booking, ['price_amount', 'reservation_fee', 'reservationFee'], null)
  let finalPaymentCents = null
  if (totalFareCents !== null && reservationFeeCents !== null) {
    finalPaymentCents = Number(totalFareCents) - Number(reservationFeeCents)
  }
  const totalFare = formatCurrency(totalFareCents)
  const reservationFee = formatCurrency(reservationFeeCents)
  const finalPayment = formatCurrency(finalPaymentCents)
  const serviceLabel = getFirstValue(booking, ['service_category', 'service_type', 'serviceCategory', 'serviceType'], '')
  const paymentStatus = getFirstValue(booking, ['payment_status', 'paymentStatus'], '')
  const paymentMethod = getFirstValue(booking, ['payment_method', 'paymentMethod'], '')
  const paymentStage = getFirstValue(booking, ['payment_stage', 'paymentStage'], '')
  const isSafariQuote =
    serviceLabel.toString().toLowerCase().includes('safari') ||
    ['awaiting_quote', 'quote_ready'].includes(paymentStatus)
  const driverName = getFirstValue(booking, ['driver_name', 'assigned_driver_name', 'driver.full_name', 'driver.name'], 'Unassigned')
  const agentName = getFirstValue(booking, ['agent_name', 'assigned_agent_name', 'agent.full_name', 'agent.name'], 'Unassigned')
  const notes = getFirstValue(booking, ['notes'], '')

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setQuoteAmountKes(totalFareCents ? String(Number(totalFareCents) / 100) : '')
  }, [isOpen, booking?.id, totalFareCents])

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
      if (onStatusChange) onStatusChange({ ...booking, ...updated })
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }

    const handleCashConfirmation = async () => {
      if (!booking?.id) return
      setError(null)
      setActionLoading('cash')
      try {
        const updated = await confirmCashPayment(booking.id)
        if (onStatusChange) onStatusChange({ ...booking, ...updated })
      } catch (err) {
        setError(err.message)
      } finally {
        setActionLoading(null)
      }
    }
  }

  const confirmCancel = async () => {
    const confirmed = window.confirm('Cancel this booking? This action cannot be undone.')
    if (!confirmed) return
    await handleStatusUpdate('cancelled')
  }

  const handleQuoteSubmit = async (event) => {
    event.preventDefault()
    if (!booking?.id) return

    const amountKes = Number(quoteAmountKes)
    if (!Number.isFinite(amountKes) || amountKes <= 0) {
      setError('Enter a valid quote amount in KES.')
      return
    }

    setError(null)
    setActionLoading('quote')
    try {
      const updated = await updateBookingQuote(booking.id, Math.round(amountKes * 100))
      if (onStatusChange) onStatusChange({ ...booking, ...updated })
    } catch (err) {
      setError(err.message)
    } finally {
      setActionLoading(null)
    }
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
	                <p className="text-xs text-gray-500 mt-2">Duration</p>
	                <p className="text-sm text-gray-900">{getFirstValue(booking, ['duration'], '—')}</p>
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
	                <span>Reservation Fee (30%)</span>
	                <span>{reservationFee}</span>
	              </div>
              <div className="flex items-center justify-between">
                <span>Final Payment Due</span>
                <span>{finalPayment}</span>
	            </div>
	              <div className="flex items-center justify-between">
	                <span>Payment Method</span>
	                <span>{paymentMethod || '—'}</span>
	              </div>
	              <div className="flex items-center justify-between">
	                <span>Payment Stage</span>
	                <span>{paymentStage || '—'}</span>
	              </div>
	          </div>

	          {isSafariQuote && (
	            <form onSubmit={handleQuoteSubmit} className="rounded-lg border border-[#C5A059]/30 bg-[#C5A059]/5 p-4">
	              <h3 className="text-sm font-semibold text-gray-900 mb-3">Safari Quote</h3>
	              {notes && <p className="mb-3 text-xs text-gray-600">{notes}</p>}
	              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
	                <div className="flex-1">
	                  <label className="text-xs font-semibold text-gray-500">Quote amount (KES)</label>
	                  <input
	                    type="number"
	                    min="1"
	                    step="1"
	                    value={quoteAmountKes}
	                    onChange={(event) => setQuoteAmountKes(event.target.value)}
	                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
	                    placeholder="e.g., 85000"
	                  />
	                </div>
	                <button
	                  type="submit"
	                  disabled={actionLoading === 'quote'}
	                  className="rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
	                >
	                  {actionLoading === 'quote' ? 'Saving...' : 'Send Quote'}
	                </button>
	              </div>
	              <p className="mt-2 text-xs text-gray-600">
	                The client can pay the 30% reservation after this quote is saved.
	              </p>
	            </form>
	          )}
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
            {paymentMethod === 'cash' && ['reservation_pending', 'final_pending'].includes(paymentStatus) && (
              <button
                type="button"
                onClick={handleCashConfirmation}
                disabled={actionLoading === 'cash'}
                className="rounded-md bg-[#B35A38] px-3 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {actionLoading === 'cash' ? 'Confirming...' : 'Confirm Cash Payment'}
              </button>
            )}
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
