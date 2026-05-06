import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for tracking flight status in real-time
 * Subscribes to flight updates and auto-triggers pickup when landed
 */
export function useFlightTracking(flightNumber, bookingId) {
  const [flight, setFlight] = useState(null)
  const [flightBooking, setFlightBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch initial flight data
  useEffect(() => {
    if (!flightNumber) return

    const fetchFlight = async () => {
      try {
        setLoading(true)
        setError(null)

        // Try to find existing flight in database
        const { data: existingFlight } = await supabase
          .from('flights')
          .select('*')
          .ilike('flight_number', flightNumber)
          .single()

        if (existingFlight) {
          setFlight(existingFlight)
        }
      } catch (err) {
        // Flight might not exist yet, that's okay
        setError(null)
      } finally {
        setLoading(false)
      }
    }

    fetchFlight()
  }, [flightNumber])

  // Subscribe to flight booking updates (real-time)
  useEffect(() => {
    if (!bookingId) return

    setLoading(true)

    const subscription = supabase
      .channel(`flight_bookings:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'flight_bookings',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setFlightBooking(payload.new)

            if (payload.new.tracking_status === 'landed') {
              // Flight has landed - trigger auto-pickup
              triggerAutoPickup(bookingId)
            }
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setLoading(false)
        }
      })

    return () => {
      subscription?.unsubscribe()
    }
  }, [bookingId])

  // Create or update flight booking
  const trackFlight = async (flightNum) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error: err } = await supabase
        .from('flight_bookings')
        .upsert({
          booking_id: bookingId,
          flight_number: flightNum,
          tracking_status: 'waiting',
          updated_at: new Date()
        }, {
          onConflict: 'booking_id'
        })
        .select()

      if (err) throw err
      return data
    } catch (err) {
      const message = err.message || 'Failed to track flight'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Stop tracking flight
  const stopTracking = async () => {
    try {
      setError(null)
      const { error: err } = await supabase
        .from('flight_bookings')
        .update({ tracking_status: 'cancelled' })
        .eq('booking_id', bookingId)

      if (err) throw err
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  // Auto-pickup trigger (called when flight lands)
  const triggerAutoPickup = async (bidId) => {
    try {
      const { error: err } = await supabase
        .from('flight_bookings')
        .update({
          tracking_status: 'picked_up',
          auto_pickup_triggered: true,
          updated_at: new Date()
        })
        .eq('booking_id', bidId)

      if (err) throw err
    } catch (err) {
      console.error('Failed to trigger auto-pickup:', err)
    }
  }

  // Get human-readable flight status
  const getFlightStatus = () => {
    if (!flightBooking) return 'No tracking'

    const statusMap = {
      waiting: '⏳ Awaiting flight departure',
      'in-air': '✈️ Flight en route',
      landed: '🛬 Flight has landed',
      picked_up: '🚗 Picked up',
      cancelled: '❌ Cancelled'
    }

    return statusMap[flightBooking.tracking_status] || flightBooking.tracking_status
  }

  return {
    flight,
    flightBooking,
    loading,
    error,
    trackFlight,
    stopTracking,
    getFlightStatus
  }
}
