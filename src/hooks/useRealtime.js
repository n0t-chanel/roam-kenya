import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Custom hook for real-time database subscriptions
 * Automatically handles subscription lifecycle
 */
export function useRealtime(tableName, event = '*') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let subscription

    const setupSubscription = async () => {
      try {
        setError(null)

        // Subscribe to changes
        subscription = supabase
          .channel(`${tableName}:${event}`)
          .on(
            'postgres_changes',
            {
              event: event === '*' ? ['INSERT', 'UPDATE', 'DELETE'] : event,
              schema: 'public',
              table: tableName
            },
            (payload) => {
              if (payload.eventType === 'DELETE') {
                setData(prev => prev.filter(item => item.id !== payload.old.id))
              } else if (payload.eventType === 'INSERT') {
                setData(prev => [...prev, payload.new])
              } else if (payload.eventType === 'UPDATE') {
                setData(prev =>
                  prev.map(item => (item.id === payload.new.id ? payload.new : item))
                )
              }
            }
          )
          .subscribe()

        // Fetch initial data
        const { data: initialData, error: err } = await supabase
          .from(tableName)
          .select()

        if (err) throw err
        setData(initialData || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    setupSubscription()

    return () => {
      subscription?.unsubscribe()
    }
  }, [tableName, event])

  return { data, loading, error }
}
