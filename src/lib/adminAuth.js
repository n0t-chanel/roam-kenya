import { supabase, supabaseAuth } from './supabase'

const INVALID_CREDENTIALS_MESSAGE = 'Invalid credentials. Access denied.'

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

  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('role, is_active')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !adminUser?.role) {
    await supabaseAuth.signOut()
    throw new Error(INVALID_CREDENTIALS_MESSAGE)
  }

  if (adminUser.is_active === false) {
    await supabaseAuth.signOut()
    throw new Error('Your account has been deactivated. Contact your administrator.')
  }

  return { user, role: adminUser.role }
}

export async function signOutAdmin() {
  const { error } = await supabaseAuth.signOut()
  if (error) throw error
}

export async function getCurrentAdminRole() {
  const { data: { session }, error } = await supabaseAuth.getSession()
  if (error) throw error
  if (!session?.user) return null

  const { data, error: roleError } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (roleError) throw roleError
  return data?.role ?? null
}
