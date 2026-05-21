import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

// Safely generate a UUIDv4 in any browser context (even insecure local HTTP environments)
const generateUUID = () => {
  if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
    try {
      return window.crypto.randomUUID()
    } catch (e) {
      // Fall through to fallback generator if restricted
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

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
    // Generate the UUID for the assignment beforehand so we don't need a SELECT query to find it
    const assignmentId = generateUUID()
    const assignedAtStr = new Date().toISOString()

    try {
      setError(null)
      setLoading(true)

      // 1. Insert the assignment row. We do NOT run .select() or .single() here to avoid triggering
      // RLS SELECT policies on booking_assignments, which might return empty or fail due to recursion.
      const { error: assignmentError } = await supabase
        .from('booking_assignments')
        .insert({
          id: assignmentId,
          booking_id: bookingId,
          driver_id: driverId,
          agent_id: agentId,
          assigned_at: assignedAtStr
        })

      if (assignmentError) {
        throw new Error(`Failed to create driver assignment: ${assignmentError.message}`)
      }

      // Pre-construct the local assignment object since it was successfully committed to the DB
      const localAssignmentRow = {
        id: assignmentId,
        booking_id: bookingId,
        driver_id: driverId,
        agent_id: agentId,
        assigned_at: assignedAtStr
      }

      // 2. Update the booking status to 'assigned'.
      // We use .maybeSingle() instead of .single() to avoid PostgREST coercion crashes if RLS is restrictive.
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'assigned', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (bookingError) {
        // Rollback the assignment write if updating the booking fails
        await supabase.from('booking_assignments').delete().eq('id', assignmentId)
        throw bookingError
      }

      if (!booking) {
        // Rollback and throw a very descriptive RLS helper error
        await supabase.from('booking_assignments').delete().eq('id', assignmentId)
        throw new Error(
          "Unable to update booking status. This is typically because your user account is missing the database Row Level Security (RLS) UPDATE policy on the 'bookings' table, or because the policy evaluates to false. Please make sure admins have UPDATE permissions."
        )
      }

      // 3. Update the driver status to 'on_trip'.
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .update({ status: 'on_trip' })
        .eq('id', driverId)
        .select()
        .maybeSingle()

      if (driverError) {
        // Rollback both assignment and booking updates
        await supabase.from('booking_assignments').delete().eq('id', assignmentId)
        await supabase.from('bookings').update({ status: previousStatus }).eq('id', bookingId)
        throw driverError
      }

      if (!driver) {
        // Rollback and throw a descriptive error
        await supabase.from('booking_assignments').delete().eq('id', assignmentId)
        await supabase.from('bookings').update({ status: previousStatus }).eq('id', bookingId)
        throw new Error(
          "Unable to update driver status. This is typically because your user account is missing the database Row Level Security (RLS) UPDATE policy on the 'drivers' table. Please ensure super_admins have UPDATE/ALL permissions on drivers."
        )
      }

      return { assignment: localAssignmentRow, booking, driver }
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

