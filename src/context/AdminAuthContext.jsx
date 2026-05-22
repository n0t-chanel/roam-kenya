import { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth } from '../lib/supabase'
import { getAdminProfile, signOutAdmin } from '../lib/adminAuth'

const AdminAuthContext = createContext(undefined)

/**
 * AdminAuthProvider component wraps your app to provide admin auth state globally
 * Usage: <AdminAuthProvider><App /></AdminAuthProvider>
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [adminId, setAdminId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const initAdminAuth = async () => {
      try {
        setError(null)
        setLoading(true)
        const { data: { session }, error: sessionError } = await supabaseAuth.getSession()
        if (sessionError) throw sessionError
        if (!isMounted) return
        if (!session?.user) {
          setUser(null)
          setRole(null)
          setAdminId(null)
          return
        }
        setUser(session.user)
        const { adminUser, role: resolvedRole } = await getAdminProfile()
        if (!isMounted) return
        setRole(resolvedRole)
        setAdminId(adminUser?.id ?? null)
      } catch (err) {
        if (!isMounted) return
        // Don't surface DB/timeout/RLS errors to the UI as fatal authentication errors.
        // Fallback to showing the login screen and let the sign-in flow handle clearer errors.
        console.warn('Admin profile check failed:', err)
        setError(null)
        setUser(null)
        setRole(null)
        setAdminId(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAdminAuth()

    const { data: { subscription } } = supabaseAuth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      try {
        setError(null)
        if (!session?.user) {
          setUser(null)
          setRole(null)
          setAdminId(null)
          return
        }
        setUser(session.user)
        const { adminUser, role: resolvedRole } = await getAdminProfile()
        if (!isMounted) return
        setRole(resolvedRole)
        setAdminId(adminUser?.id ?? null)
      } catch (err) {
        if (!isMounted) return
        console.warn('Admin profile refresh failed:', err)
        setError(null)
        setUser(null)
        setRole(null)
        setAdminId(null)
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      setError(null)
      await signOutAdmin()
      setUser(null)
      setRole(null)
      setAdminId(null)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, role, adminId, loading, error, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

/**
 * Custom hook to access admin auth state throughout your app
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
