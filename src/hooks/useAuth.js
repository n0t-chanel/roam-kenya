import { useState, useEffect } from 'react'
import { supabase, supabaseAuth } from '../lib/supabase'

/**
 * Custom hook for managing authentication state
 * Handles login, logout, signup, and session management
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const syncProfile = async (sessionUser) => {
      if (!sessionUser) return
      try {
        const metadata = sessionUser.user_metadata || {}
        let resolvedName = metadata.full_name || metadata.name
        
        if (!resolvedName) {
          if (metadata.is_anonymous) {
            resolvedName = 'Guest User'
          } else {
            resolvedName = sessionUser.email
          }
        }

        await supabase.from('user_profiles').upsert({
          id: sessionUser.id,
          email: sessionUser.email,
          full_name: resolvedName,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })
      } catch (err) {
        console.error('Profile sync error:', err)
      }
    }

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabaseAuth.getSession()
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) syncProfile(currentUser)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseAuth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (event === 'SIGNED_IN' && currentUser) {
          syncProfile(currentUser)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    try {
      setError(null)
      const { data, error } = await supabaseAuth.signUp({ email, password })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signIn = async (email, password) => {
    try {
      setError(null)
      const { data, error } = await supabaseAuth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabaseAuth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const resetPassword = async (email) => {
    try {
      setError(null)
      const { error } = await supabaseAuth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const { data, error } = await supabaseAuth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    }
  }

  const signInWithFacebook = async () => {
    try {
      setError(null)
      const { data, error } = await supabaseAuth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      if (error) throw error
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    }
  }

  const signUpAnonymous = async () => {
    try {
      setError(null)
      // Create a temporary anonymous user with valid email format
      const tempEmail = `guest${Date.now()}@guest.roamkenya.com`
      const tempPassword = Math.random().toString(36).slice(-12)
      
      const { data, error } = await supabaseAuth.signUp({
        email: tempEmail,
        password: tempPassword,
        options: {
          data: {
            is_anonymous: true,
            full_name: 'Guest User'
          }
        }
      })
      
      if (error) throw error
      
      // Auto sign in the anonymous user
      const { error: signInError } = await supabaseAuth.signInWithPassword({
        email: tempEmail,
        password: tempPassword
      })
      
      if (signInError) throw signInError
      
      return { success: true, data }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err }
    }
  }

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle,
    signInWithFacebook,
    signUpAnonymous
  }
}
