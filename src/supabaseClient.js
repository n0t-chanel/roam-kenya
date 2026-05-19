import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://hpgetrpchmujvjwnjoxy.supabase.co/rest/v1/'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZ2V0cnBjaG11anZqd25qb3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNTM3NTUsImV4cCI6MjA5MzYyOTc1NX0.0o-YpJXPde0VDE1otKyoLpv0AkbVQk6qkwNvrOarnBc'

export const supabase = createClient(supabaseUrl, supabaseKey)