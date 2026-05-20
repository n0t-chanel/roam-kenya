import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { driverAssignedCustomerEmail, driverAssignedDriverEmail } from '../../lib/emailTemplates'
import { sendEmail } from '../../lib/resendClient'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useDriverAssignment } from '../../hooks/useDriverAssignment'
import { formatDateTime, getBookingDateTimeValue, getFirstValue } from '../../hooks/useBookings'

export default function DriverAssignmentModal({ booking, isOpen, onClose, onAssigned }) {
  const { user } = useAdminAuth()
  const { fetchAvailableDrivers, assignDriver, loading } = useDriverAssignment()
  const [drivers, setDrivers] = useState([])
  const [selectedDriverId, setSelectedDriverId] = useState(null)
  const [adminId, setAdminId] = useState(null)
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)
  const [emailWarning, setEmailWarning] = useState(null)

  const bookingDetails = useMemo(() => {
    if (!booking) return null
    return {
      id: booking.id,
      customerName: getFirstValue(booking, ['customer_name', 'customerName', 'customer.full_name', 'customer.name', 'full_name', 'name'], 'Customer'),
      customerEmail: getFirstValue(booking, ['customer_email', 'customerEmail', 'email'], ''),
      customerPhone: getFirstValue(booking, ['customer_phone', 'customerPhone', 'phone'], ''),
      pickupLocation: getFirstValue(booking, ['pickup_location', 'pickup', 'pickupLocation'], '—'),
      destination: getFirstValue(booking, ['destination_location', 'destination', 'dropoff', 'dropoff_location'], '—'),
      pickupDatetime: formatDateTime(getBookingDateTimeValue(booking)),
      vehicleType: getFirstValue(booking, ['vehicle_type', 'vehicleType'], '—')
    }
  }, [booking])

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setNotice(null)
    setEmailWarning(null)
    setSelectedDriverId(null)

    const loadAdmin = async () => {
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
    }

    const loadDrivers = async () => {
      try {
        const data = await fetchAvailableDrivers()
        setDrivers(data)
      } catch (err) {
        setError(err.message)
      }
    }

    loadAdmin()
    loadDrivers()
  }, [isOpen, user, fetchAvailableDrivers])

  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId)

  const handleConfirm = async () => {
    if (!bookingDetails || !selectedDriver || !adminId) return
    setError(null)
    setNotice(null)
    setEmailWarning(null)
    try {
      const result = await assignDriver({
        bookingId: bookingDetails.id,
        driverId: selectedDriver.id,
        agentId: adminId,
        previousStatus: booking?.status || 'new'
      })

      const customerEmail = bookingDetails.customerEmail
      const driverEmail = selectedDriver.email
      const bookingIdShort = bookingDetails.id?.slice(0, 6)?.toUpperCase() || bookingDetails.id

      let emailFailed = false

      if (customerEmail) {
        const customerTemplate = driverAssignedCustomerEmail({
          customerName: bookingDetails.customerName,
          driverName: selectedDriver.name,
          driverPhone: selectedDriver.phone,
          pickupLocation: bookingDetails.pickupLocation,
          pickupDatetime: bookingDetails.pickupDatetime,
          destination: bookingDetails.destination,
          bookingId: bookingIdShort
        })
        await sendEmail({ to: customerEmail, subject: customerTemplate.subject, html: customerTemplate.html })
      } else {
        emailFailed = true
      }

      if (driverEmail) {
        const driverTemplate = driverAssignedDriverEmail({
          driverName: selectedDriver.name,
          customerName: bookingDetails.customerName,
          customerPhone: bookingDetails.customerPhone,
          pickupLocation: bookingDetails.pickupLocation,
          pickupDatetime: bookingDetails.pickupDatetime,
          destination: bookingDetails.destination,
          bookingId: bookingIdShort
        })
        await sendEmail({ to: driverEmail, subject: driverTemplate.subject, html: driverTemplate.html })
      } else {
        console.warn('Driver email missing, skipping driver notification.')
        emailFailed = true
      }

      if (emailFailed) {
        setEmailWarning('Assignment saved — email notification failed.')
      } else {
        setNotice('Driver assigned and notifications sent.')
      }

      if (onAssigned) onAssigned(result)
      onClose()
    } catch (err) {
      setError(err.message || 'Unable to assign driver.')
    }
  }

  if (!isOpen || !bookingDetails) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assign Driver</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Booking Summary</h3>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-700">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p>{bookingDetails.customerName}</p>
                <p className="text-xs text-gray-500 mt-2">Pickup</p>
                <p>{bookingDetails.pickupLocation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p>{bookingDetails.destination}</p>
                <p className="text-xs text-gray-500 mt-2">Date/Time</p>
                <p>{bookingDetails.pickupDatetime}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Vehicle Type: {bookingDetails.vehicleType}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Drivers</h3>
            {drivers.length === 0 ? (
              <div className="text-sm text-gray-600">
                No drivers currently available. Add drivers in the Drivers section.{' '}
                <Link to="/admin/drivers" className="text-[#B35A38] font-semibold hover:underline">
                  Go to Drivers
                </Link>
                .
              </div>
            ) : (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                {drivers.map((driver) => {
                  const isSelected = driver.id === selectedDriverId
                  return (
                    <div
                      key={driver.id}
                      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                        isSelected ? 'border-[#B35A38] bg-orange-50' : 'border-gray-200'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.phone}</p>
                        <p className="text-xs text-gray-500">
                          {driver.vehicle_type} {driver.vehicle_plate ? `• ${driver.vehicle_plate}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDriverId(driver.id)}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                          isSelected
                            ? 'bg-[#B35A38] text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Confirm Assignment</h3>
            <p className="text-sm text-gray-700">
              Assign <span className="font-semibold">{selectedDriver?.name || '...'}</span> to{' '}
              <span className="font-semibold">{bookingDetails.customerName}</span>'s booking?
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {notice && <p className="text-sm text-green-600">{notice}</p>}
          {emailWarning && <p className="text-sm text-amber-600">{emailWarning}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedDriverId || loading || !adminId}
            className="rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </button>
        </div>
      </div>
    </div>
  )
}
