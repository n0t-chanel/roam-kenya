// Thin wrapper around Resend API
// from: 'Roam Kenya <bookings@roamkenya.com>' (placeholder, easy to swap)
export async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Roam Kenya <bookings@roamkenya.com>',
      to,
      subject,
      html
    })
  })
  if (!res.ok) throw new Error('Failed to send email')
  return res.json()
}
