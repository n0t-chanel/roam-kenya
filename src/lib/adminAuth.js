import { supabase, supabaseAuth } from './supabase'

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials. Access denied.'
const ALLOWED_ROLES = ['super_admin', 'booking_agent', 'driver']

const normalizeAdminRole = (adminUser) => {
  if (!adminUser) {
    throw new Error(
      "Access denied. No administrator record found for this account in the 'admin_users' table."
    )
  }

  const role = adminUser.role?.toLowerCase()
  if (!role || !ALLOWED_ROLES.includes(role)) {
    throw new Error(
      `Access denied. The role "${adminUser.role}" specified in the 'admin_users' table is invalid. Allowed roles are: ${ALLOWED_ROLES.join(', ')}.`
    )
  }

  if (adminUser.is_active === false) {
    throw new Error('Your account has been deactivated. Contact your administrator.')
  }

  return role
}

export async function fetchAdminProfile() {
  const { data, error } = await supabase.functions.invoke('get-admin-role', { body: {} })
  if (error) {
    throw new Error(error.message || 'Unable to verify admin access.')
  }
  if (!data?.success) {
    throw new Error(data?.error || 'Access denied. No administrator profile found.')
  }
  return data?.adminUser
}

export async function getAdminProfile() {
  const adminUser = await fetchAdminProfile()
  const role = normalizeAdminRole(adminUser)
  return { adminUser, role }
}

export async function signInAdmin(email, password) {
  const { data, error } = await supabaseAuth.signInWithPassword({ email, password })
  if (error) {
    const normalizedMessage = error.message?.toLowerCase().includes('invalid login credentials')
      ? INVALID_CREDENTIALS_MESSAGE
      : error.message
    throw new Error(normalizedMessage)
  }

  const user = data?.user
  if (!user) {
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  try {
    const { adminUser, role } = await getAdminProfile()
    return { user, role, adminId: adminUser?.id ?? null }
  } catch (err) {
    await supabaseAuth.signOut()
    throw new Error(err.message)
  }
}

export async function signOutAdmin() {
  const { error } = await supabaseAuth.signOut()
  if (error) throw error
}

export async function getCurrentAdminRole() {
  const { data: { session }, error } = await supabaseAuth.getSession()
  if (error) throw error
  if (!session?.user) return null

  const { role } = await getAdminProfile()
  return role ?? null
}
