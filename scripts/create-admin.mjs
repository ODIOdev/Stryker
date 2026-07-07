/**
 * Create or update the master admin user.
 * Usage: node scripts/create-admin.mjs [email] [password]
 * Loads credentials from .env.local (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
 */
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const envPath = join(root, '.env.local')

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = value
  }
}

const email = (process.argv[2] ?? 'admin@gmail.com').trim().toLowerCase()
const password = process.argv[3] ?? process.env.ADMIN_PASSWORD

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local')
  process.exit(1)
}

if (!password) {
  console.error('Provide password as second argument or set ADMIN_PASSWORD in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Ensure role column exists (idempotent)
const postgres = (await import('postgres')).default
const dbUrl = process.env.DATABASE_URL
if (dbUrl) {
  const sql = postgres(dbUrl, { ssl: 'require', max: 1 })
  const migration = readFileSync(join(root, 'supabase/migrations/002_admin_role.sql'), 'utf8')
  try {
    await sql.unsafe(migration)
    console.log('Admin role migration applied.')
  } catch (err) {
    console.warn('Migration note:', err.message)
  } finally {
    await sql.end()
  }
}

const { data: listData } = await supabase.auth.admin.listUsers({ perPage: 1000 })
const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email)

let userId

if (existing) {
  userId = existing.id
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Admin', role: 'master_admin' },
  })
  if (error) {
    console.error('Failed to update user:', error.message)
    process.exit(1)
  }
  console.log('Updated existing user:', email)
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: 'Admin', role: 'master_admin' },
  })
  if (error) {
    console.error('Failed to create user:', error.message)
    process.exit(1)
  }
  userId = data.user.id
  console.log('Created master admin:', email)
}

const { error: profileError } = await supabase.from('profiles').upsert(
  {
    id: userId,
    email,
    display_name: 'Admin',
    role: 'master_admin',
    updated_at: new Date().toISOString(),
  },
  { onConflict: 'id' }
)

if (profileError && dbUrl) {
  const sql = postgres(dbUrl, { ssl: 'require', max: 1 })
  try {
    await sql`
      insert into public.profiles (id, email, display_name, role)
      values (${userId}, ${email}, 'Admin', 'master_admin')
      on conflict (id) do update set
        role = 'master_admin',
        display_name = 'Admin',
        email = excluded.email,
        updated_at = now()
    `
    console.log('Profile updated via direct SQL.')
  } finally {
    await sql.end()
  }
} else if (profileError) {
  console.error('Profile update failed:', profileError.message)
  process.exit(1)
}

console.log('Master admin ready. Role: master_admin')
