import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'

/**
 * ProtectedRoute component protects routes that require authentication
 * Redirects unauthenticated users to login
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
