import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useDriverAssignment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAvailableDrivers = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const { data, error: queryError } = await supabase
        .from('drivers')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: true })

      if (queryError) throw queryError
      return data || []
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const assignDriver = useCallback(async ({ bookingId, driverId, agentId, previousStatus = 'new' }) => {
    let assignmentRow = null
    try {
      setError(null)
      setLoading(true)

      const { data: assignment, error: assignmentError } = await supabase
        .from('booking_assignments')
        .insert({
          booking_id: bookingId,
          driver_id: driverId,
          agent_id: agentId,
          assigned_at: new Date().toISOString()
        })
        .select()
        .single()

      if (assignmentError) throw assignmentError
      assignmentRow = assignment

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .single()

      if (bookingError) {
        await supabase.from('booking_assignments').delete().eq('id', assignmentRow.id)
        throw bookingError
      }

      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .update({ status: 'on_trip' })
        .eq('id', driverId)
        .select()
        .single()

      if (driverError) {
        await supabase.from('booking_assignments').delete().eq('id', assignmentRow.id)
        await supabase.from('bookings').update({ status: previousStatus }).eq('id', bookingId)
        throw driverError
      }

      return { assignment, booking, driver }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchAvailableDrivers,
    assignDriver
  }
}
