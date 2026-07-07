import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase credentials are not configured')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function getUserFromRequest(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export async function ensureProfile(user: { id: string; email?: string | null }) {
  const supabase = getSupabaseAdmin()
  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? null,
      display_name: user.email?.split('@')[0] ?? 'Trader',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )
}
