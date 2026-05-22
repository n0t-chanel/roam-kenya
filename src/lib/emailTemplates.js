const BRAND_COLOR = '#B35A38'

const wrapTemplate = (title, body) => `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 6px 18px rgba(0,0,0,0.08);">
      <div style="background: ${BRAND_COLOR}; color: #ffffff; padding: 16px 24px;">
        <h1 style="margin: 0; font-size: 20px;">${title}</h1>
      </div>
      <div style="padding: 24px; color: #111827; font-size: 14px; line-height: 1.6;">
        ${body}
      </div>
    </div>
  </div>
`

export const driverAssignedCustomerEmail = ({
  customerName,
  driverName,
  driverPhone,
  pickupLocation,
  pickupDatetime,
  destination,
  bookingId
}) => {
  const body = `
    <p>Hello ${customerName || 'there'},</p>
    <p>Your driver has been assigned. Here are the details for booking <strong>#${bookingId}</strong>:</p>
    <p><strong>Driver:</strong> ${driverName || 'Assigned driver'}</p>
    <p><strong>Driver Phone:</strong> ${driverPhone || 'Provided upon request'}</p>
    <p><strong>Pickup:</strong> ${pickupLocation}</p>
    <p><strong>Destination:</strong> ${destination}</p>
    <p><strong>Date/Time:</strong> ${pickupDatetime}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    <p style="font-size: 12px; color: #6b7280;">Roam Kenya Support — support@roamkenya.com</p>
  `

  return {
    subject: `Your driver has been assigned — Booking #${bookingId}`,
    html: wrapTemplate('Driver Assigned', body)
  }
}

export const driverAssignedDriverEmail = ({
  driverName,
  customerName,
  customerPhone,
  pickupLocation,
  pickupDatetime,
  destination,
  bookingId
}) => {
  const body = `
    <p>Hello ${driverName || 'Driver'},</p>
    <p>You have a new trip assignment for booking <strong>#${bookingId}</strong>:</p>
    <p><strong>Customer:</strong> ${customerName || 'Customer'}</p>
    <p><strong>Customer Phone:</strong> ${customerPhone || 'Provided upon request'}</p>
    <p><strong>Pickup:</strong> ${pickupLocation}</p>
    <p><strong>Destination:</strong> ${destination}</p>
    <p><strong>Date/Time:</strong> ${pickupDatetime}</p>
    <p style="margin-top: 16px; font-weight: bold;">Please contact the customer to confirm arrival time.</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    <p style="font-size: 12px; color: #6b7280;">Roam Kenya Operations</p>
  `

  return {
    subject: `New trip assigned to you — Booking #${bookingId}`,
    html: wrapTemplate('New Trip Assignment', body)
  }
}

export const bookingStatusUpdateEmail = ({
  customerName,
  status,
  pickupLocation,
  destination,
  pickupDatetime,
  bookingId
}) => {
  const normalized = status === 'completed' ? 'completed' : 'en_route'
  const statusMessage =
    normalized === 'completed'
      ? 'Your trip is complete. Thank you for riding with Roam Kenya.'
      : 'Your driver is on the way.'

  const body = `
    <p>Hello ${customerName || 'there'},</p>
    <p><strong>${statusMessage}</strong></p>
    <p>Booking <strong>#${bookingId}</strong> details:</p>
    <p><strong>Pickup:</strong> ${pickupLocation}</p>
    <p><strong>Destination:</strong> ${destination}</p>
    <p><strong>Date/Time:</strong> ${pickupDatetime}</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
    <p style="font-size: 12px; color: #6b7280;">Roam Kenya Support — support@roamkenya.com</p>
  `

  return {
    subject: `Booking update — #${bookingId}`,
    html: wrapTemplate('Booking Update', body)
  }
}
