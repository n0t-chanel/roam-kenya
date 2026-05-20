import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, X } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

const ROLE_OPTIONS = [
  { label: 'Booking Agent', value: 'booking_agent' },
  { label: 'Driver', value: 'driver' }
]

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  booking_agent: 'Booking Agent',
  driver: 'Driver'
}

export default function AgentsManagement() {
  const [agents, setAgents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalState, setModalState] = useState({ type: null, agent: null })
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    password: '',
    role: 'booking_agent'
  })
  const [formError, setFormError] = useState(null)
  const [detailsAssignments, setDetailsAssignments] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)

  const loadAgents = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const { data: adminRows, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (adminError) throw adminError
      setAgents(adminRows || [])

      const { data: assignmentRows, error: assignmentError } = await supabase
        .from('booking_assignments')
        .select('id, agent_id, assigned_at, completed_at')
        .order('assigned_at', { ascending: false })

      if (assignmentError) throw assignmentError
      setAssignments(assignmentRows || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAgents()
  }, [loadAgents])

  const assignmentStats = useMemo(() => {
    const stats = new Map()
    assignments.forEach((assignment) => {
      if (!assignment.agent_id) return
      const existing = stats.get(assignment.agent_id) || {
        totalAssigned: 0,
        totalCompleted: 0,
        lastActive: null
      }
      existing.totalAssigned += 1
      if (assignment.completed_at) existing.totalCompleted += 1
      if (assignment.assigned_at) {
        const time = new Date(assignment.assigned_at)
        if (!existing.lastActive || time > existing.lastActive) existing.lastActive = time
      }
      stats.set(assignment.agent_id, existing)
    })
    return stats
  }, [assignments])

  const openModal = (type, agent = null) => {
    setFormError(null)
    setModalState({ type, agent })
    if (agent && type === 'edit') {
      setFormState({
        name: agent.name || '',
        email: agent.email || '',
        password: '',
        role: agent.role || 'booking_agent'
      })
    } else {
      setFormState({
        name: '',
        email: '',
        password: '',
        role: 'booking_agent'
      })
    }
  }

  const closeModal = () => {
    setModalState({ type: null, agent: null })
    setDetailsAssignments([])
  }

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const saveAgent = async () => {
    if (!formState.name.trim() || !formState.email.trim() || (!modalState.agent && !formState.password.trim())) {
      setFormError('All fields are required.')
      return
    }

    try {
      setFormError(null)
      if (modalState.type === 'edit' && modalState.agent) {
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ name: formState.name.trim(), role: formState.role })
          .eq('id', modalState.agent.id)
        if (updateError) throw updateError
      } else {
        // NOTE: This requires the service role key; in production use a secure server/edge function.
        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: formState.email.trim(),
          password: formState.password.trim(),
          email_confirm: true,
          user_metadata: { full_name: formState.name.trim() }
        })
        if (createError) throw createError

        const { error: insertError } = await supabase.from('admin_users').insert({
          user_id: created.user.id,
          role: formState.role,
          name: formState.name.trim(),
          is_active: true
        })
        if (insertError) throw insertError
      }

      await loadAgents()
      closeModal()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const deactivateAgent = async (agent) => {
    const confirmed = window.confirm(`Deactivate ${agent.name}? They will no longer be able to log in.`)
    if (!confirmed) return
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ is_active: false })
      .eq('id', agent.id)
    if (updateError) {
      setError(updateError.message)
      return
    }
    loadAgents()
  }

  const openDetails = async (agent) => {
    setModalState({ type: 'details', agent })
    setDetailsLoading(true)
    try {
      const { data, error: detailsError } = await supabase
        .from('booking_assignments')
        .select('id, assigned_at, completed_at, bookings (*)')
        .eq('agent_id', agent.id)
        .order('assigned_at', { ascending: false })
        .limit(10)
      if (detailsError) throw detailsError
      setDetailsAssignments(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setDetailsLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Agents</h2>
            <p className="text-sm text-gray-500 mt-1">Manage booking agents and driver accounts.</p>
          </div>
          <button
            type="button"
            onClick={() => openModal('add')}
            className="inline-flex items-center gap-2 rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add Agent
          </button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Bookings Assigned</th>
                  <th className="px-4 py-3 text-left">Bookings Completed</th>
                  <th className="px-4 py-3 text-left">Last Active</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                      Loading agents...
                    </td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                      No agents found.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => {
                    const stats = assignmentStats.get(agent.id) || {}
                    return (
                      <tr key={agent.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-semibold text-gray-900">{agent.name || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{agent.email || '—'}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-[#B35A38]">
                            {ROLE_LABELS[agent.role] || agent.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{stats.totalAssigned || 0}</td>
                        <td className="px-4 py-3 text-gray-600">{stats.totalCompleted || 0}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {stats.lastActive ? stats.lastActive.toLocaleString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openDetails(agent)}
                              className="text-xs font-semibold text-[#B35A38] hover:underline"
                            >
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal('edit', agent)}
                              className="text-xs font-semibold text-gray-600 hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deactivateAgent(agent)}
                              className="text-xs font-semibold text-red-600 hover:underline"
                            >
                              Deactivate
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(modalState.type === 'add' || modalState.type === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {modalState.type === 'edit' ? 'Edit Agent' : 'Add Agent'}
              </h2>
              <button type="button" onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-500">Full Name</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.name}
                  onChange={(event) => handleFormChange('name', event.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Email</label>
                <input
                  type="email"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.email}
                  onChange={(event) => handleFormChange('email', event.target.value)}
                  disabled={modalState.type === 'edit'}
                />
              </div>
              {modalState.type !== 'edit' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500">Password</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                    value={formState.password}
                    onChange={(event) => handleFormChange('password', event.target.value)}
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500">Role</label>
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formState.role}
                  onChange={(event) => handleFormChange('role', event.target.value)}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveAgent}
                className="rounded-md bg-[#B35A38] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'details' && modalState.agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Agent Details</h2>
                <p className="text-sm text-gray-500">{modalState.agent.name}</p>
              </div>
              <button type="button" onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p>{modalState.agent.email || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p>{ROLE_LABELS[modalState.agent.role] || modalState.agent.role}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p>{modalState.agent.is_active ? 'Active' : 'Deactivated'}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs text-gray-500">Total Assigned</p>
                  <p>{assignmentStats.get(modalState.agent.id)?.totalAssigned || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Completed</p>
                  <p>{assignmentStats.get(modalState.agent.id)?.totalCompleted || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completion Rate</p>
                  <p>
                    {assignmentStats.get(modalState.agent.id)?.totalAssigned
                      ? Math.round(
                          (assignmentStats.get(modalState.agent.id).totalCompleted /
                            assignmentStats.get(modalState.agent.id).totalAssigned) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Booking ID</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailsLoading ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                          Loading assignments...
                        </td>
                      </tr>
                    ) : detailsAssignments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                          No recent assignments found.
                        </td>
                      </tr>
                    ) : (
                      detailsAssignments.map((assignment) => {
                        const booking = assignment.bookings || {}
                        return (
                          <tr key={assignment.id} className="border-t border-gray-100">
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {booking.id ? `#${booking.id.slice(0, 6).toUpperCase()}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{booking.customer_name || booking.customerName || '—'}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {booking.pickup_datetime || booking.booking_date || '—'}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{booking.status || '—'}</td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
