import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

const STATUS_NORMALIZATION = {
  pending: 'new',
  new: 'new',
  assigned: 'assigned',
  confirmed: 'assigned',
  en_route: 'en_route',
  'en-route': 'en_route',
  enroute: 'en_route',
  in_transit: 'en_route',
  completed: 'completed',
  cancelled: 'cancelled'
}

const STATUS_LABELS = {
  new: 'New',
  assigned: 'Assigned',
  en_route: 'En Route',
  completed: 'Completed',
  cancelled: 'Cancelled'
}

const STATUS_BADGES = {
  new: 'bg-blue-100 text-blue-700',
  assigned: 'bg-amber-100 text-amber-700',
  en_route: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
}

const resolveNestedValue = (obj, path) => {
  if (!obj) return undefined
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

export const getFirstValue = (obj, paths, fallback = '') => {
  if (!obj) return fallback
  for (const path of paths) {
    const value = resolveNestedValue(obj, path)
    if (value !== undefined && value !== null && value !== '') {
      return value
    }
  }
  return fallback
}

export const normalizeStatus = (status) => {
  const key = typeof status === 'string' ? status.toLowerCase() : ''
  return STATUS_NORMALIZATION[key] || key || 'new'
}

export const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status)
  return STATUS_LABELS[normalized] || normalized || 'Unknown'
}

export const getStatusBadgeClass = (status) => {
  const normalized = normalizeStatus(status)
  return STATUS_BADGES[normalized] || 'bg-gray-100 text-gray-700'
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

export const getBookingDateTimeValue = (booking) => {
  if (!booking) return null
  if (booking.pickup_datetime) return booking.pickup_datetime
  if (booking.booking_date) {
    const timeValue = booking.pickup_time || '00:00:00'
    return `${booking.booking_date}T${timeValue}`
  }
  return booking.created_at
}

export const formatCurrency = (valueInCents) => {
  if (valueInCents === undefined || valueInCents === null || valueInCents === '') return '—'
  const amountCents = Number(valueInCents)
  if (Number.isNaN(amountCents)) return valueInCents
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountCents / 100)
}

/**
 * Custom hook for admin bookings operations
 */
export function useBookings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBookings = useCallback(async (filters = {}) => {
    try {
      setError(null)
      setLoading(true)
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false })

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.serviceType && filters.serviceField) {
        query = query.eq(filters.serviceField, filters.serviceType)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }

      const { data, error: queryError } = await query
      if (queryError) throw queryError

      if (!data || data.length === 0) return []

      // 1. Fetch user profiles for the bookings
      const userIds = [...new Set(data.map((b) => b.user_id).filter(Boolean))]
      let profiles = []
      if (userIds.length > 0) {
        const { data: pData } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, phone')
          .in('id', userIds)
        if (pData) profiles = pData
      }

      // 2. Fetch driver and agent assignments
      const bookingIds = data.map((b) => b.id)
      let assignments = []
      if (bookingIds.length > 0) {
        const { data: aData } = await supabase
          .from('booking_assignments')
          .select('booking_id, drivers(name), admin_users(name)')
          .in('booking_id', bookingIds)
        if (aData) assignments = aData
      }

      const profileMap = profiles.reduce((acc, p) => ({ ...acc, [p.id]: p }), {})
      const assignMap = assignments.reduce((acc, a) => ({ ...acc, [a.booking_id]: a }), {})

      const enrichedData = data.map((b) => {
        const profile = profileMap[b.user_id] || {}
        const assignment = assignMap[b.id] || {}
        
        let fallbackPhone = '—'
        if (b.notes && b.notes.includes('Phone:')) {
          const match = b.notes.match(/Phone:\s*([^\.]+)/)
          if (match && match[1]) fallbackPhone = match[1].trim()
        }

        return {
          ...b,
          customer_name: profile.full_name || b.customer_name || b.full_name || 'Unknown',
          customer_email: profile.email || b.customer_email || b.email || '—',
          customer_phone: profile.phone || b.customer_phone || b.phone || fallbackPhone,
          driver_name: assignment.drivers?.name || 'Unassigned',
          agent_name: assignment.admin_users?.name || 'Unassigned'
        }
      })

      return enrichedData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateBookingStatus = useCallback(async (bookingId, newStatus) => {
    try {
      setError(null)
      setLoading(true)
      // Fetch current booking state to prevent double-counting and get fare
      const { data: currentBooking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single()
      
      if (fetchErr) throw fetchErr

      const { data, error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .select()
        .maybeSingle()

      if (updateError) throw updateError

      // If marking as completed and it wasn't already completed
      if (newStatus === 'completed' && currentBooking.status !== 'completed') {
        const { data: assignment } = await supabase
          .from('booking_assignments')
          .select('*')
          .eq('booking_id', bookingId)
          .is('completed_at', null)
          .maybeSingle()
        
        if (assignment && assignment.driver_id) {
          // 1. Mark assignment as completed
          await supabase.from('booking_assignments')
            .update({ completed_at: new Date().toISOString() })
            .eq('id', assignment.id)
          
          // 2. Set driver back to available
          await supabase.from('drivers')
            .update({ status: 'available' })
            .eq('id', assignment.driver_id)

          // 3. Update driver performance metrics
          const { data: perf } = await supabase
            .from('driver_performance')
            .select('*')
            .eq('driver_id', assignment.driver_id)
            .maybeSingle()
            
          if (perf) {
            const fare = Number(currentBooking.total_fare ?? currentBooking.total_price ?? 0)
            await supabase.from('driver_performance')
              .update({
                trips_completed: (perf.trips_completed || 0) + 1,
                earnings_total: Number(perf.earnings_total || 0) + (Number.isNaN(fare) ? 0 : fare)
              })
              .eq('driver_id', assignment.driver_id)
          }
        }
      }

      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const subscribeToBookings = useCallback((callback) => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        (payload) => {
          callback(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    loading,
    error,
    fetchBookings,
    updateBookingStatus,
    subscribeToBookings
  }
}
