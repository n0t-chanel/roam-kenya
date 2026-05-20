import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart3, ClipboardList, LayoutDashboard, Menu, Truck, Users, X } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Bookings', to: '/admin/bookings', icon: ClipboardList },
  { label: 'Drivers', to: '/admin/drivers', icon: Truck },
  { label: 'Agents', to: '/admin/agents', icon: Users },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 }
]

export default function AdminLayout({ children }) {
  const navigate = useNavigate()
  const { user, role, signOut } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userLabel = user?.user_metadata?.full_name || user?.email || 'Admin'
  const roleLabel = role === 'super_admin' ? 'Super Admin' : role === 'booking_agent' ? 'Booking Agent' : role === 'driver' ? 'Driver' : null

  const handleSignOut = async () => {
    await signOut()
    navigate('/isAdmin', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-900">Roam Kenya Admin</span>
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#B35A38] text-white'
                        : 'text-gray-700 hover:bg-orange-50'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu overlay"
          />
        )}

        <div className="flex-1 lg:ml-64">
          <header className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Roam Kenya Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <span>{userLabel}</span>
                {roleLabel && (
                  <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-[#B35A38]">
                    {roleLabel}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-md bg-[#B35A38] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Sign Out
              </button>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
