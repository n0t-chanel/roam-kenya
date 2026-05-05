import { useState, useEffect } from 'react'
import { supabaseAuth } from '../lib/supabase'

/**
 * Custom hook for managing authentication state
 * Handles login, logout, signup, and session management
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabaseAuth.getSession()
        setUser(session?.user ?? null)
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
        setUser(session?.user ?? null)
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

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword
  }
}
