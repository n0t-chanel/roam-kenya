import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInAdmin } from '../../lib/adminAuth'
import { useAdminAuth } from '../../context/AdminAuthContext'

const ROLE_ROUTES = {
  super_admin: '/admin',
  booking_agent: '/agent',
  driver: '/driver'
}

export default function AdminLogin() {
  const navigate = useNavigate()
  const { role, loading: authLoading, error: globalError } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && role) {
      const destination = ROLE_ROUTES[role] ?? '/isAdmin'
      navigate(destination, { replace: true })
    }
  }, [authLoading, role, navigate])

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      setError(null)
      setLoading(true)
      const { role: resolvedRole } = await signInAdmin(email, password)
      const destination = ROLE_ROUTES[resolvedRole] ?? '/isAdmin'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.message || 'Invalid credentials. Access denied.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B35A38] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="h-12 w-12 rounded-full bg-[#B35A38] text-white flex items-center justify-center font-semibold">
            RK
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-center text-gray-900">Admin Access</h1>
        <p className="text-sm text-gray-500 text-center mt-2">
          Sign in to manage Roam Kenya operations.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B35A38] focus:border-[#B35A38]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B35A38] focus:border-[#B35A38]"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {(error || globalError) && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {error || globalError}
          </p>
        )}
      </div>
    </div>
  )
}
