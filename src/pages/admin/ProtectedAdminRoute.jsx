import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

/**
 * Protects admin routes based on allowedRoles
 */
export function ProtectedAdminRoute({ children, allowedRoles = [] }) {
  const { role, loading, error } = useAdminAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B35A38] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-xl w-full bg-red-50 text-red-700 p-6 rounded-lg border border-red-200">
          <h2 className="text-lg font-bold mb-2">Authentication Error</h2>
          <p>{error}</p>
          <div className="mt-6">
            <button onClick={() => window.location.href = '/isAdmin'} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Return to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/isAdmin" replace />
  }

  return children
}
