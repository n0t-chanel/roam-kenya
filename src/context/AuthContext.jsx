import { createContext, useContext } from 'react'
import { useAuth } from '../hooks/useAuth'

const AuthContext = createContext(undefined)

/**
 * AuthProvider component wraps your app to provide auth state globally
 * Usage: <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access auth state throughout your app
 */
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
