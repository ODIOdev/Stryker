#!/usr/bin/env node
/**
 * Pull Supabase API keys and push to Vercel + .env.local
 * Usage: node scripts/setup-env.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const projectRef = 'xrwvaelhmibhslmfvxrs'
const vercel = '/Users/neo/.local/node/bin/vercel'
const supabase = '/Users/neo/.local/node/bin/supabase'

const raw = execSync(
  `${supabase} projects api-keys --project-ref ${projectRef} --reveal`,
  { encoding: 'utf8' }
)
const { keys } = JSON.parse(raw)
const anon = keys.find((k) => k.name === 'anon')?.api_key
const serviceRole = keys.find((k) => k.name === 'service_role')?.api_key

if (!anon || !serviceRole) {
  console.error('Could not retrieve Supabase API keys')
  process.exit(1)
}

const envPath = join(root, '.env.local')
let existing = ''
if (existsSync(envPath)) existing = readFileSync(envPath, 'utf8')

const get = (key) => {
  const m = existing.match(new RegExp(`^${key}=(.*)$`, 'm'))
  return m?.[1] ?? ''
}

const databaseUrl =
  get('DATABASE_URL') ||
  'postgresql://postgres:Goldm%21nks21@db.xrwvaelhmibhslmfvxrs.supabase.co:5432/postgres'

const envContent = `VITE_SUPABASE_URL=https://${projectRef}.supabase.co
VITE_SUPABASE_ANON_KEY=${anon}

SUPABASE_URL=https://${projectRef}.supabase.co
SUPABASE_ANON_KEY=${anon}
SUPABASE_SERVICE_ROLE_KEY=${serviceRole}
DATABASE_URL=${databaseUrl}

FINNHUB_API_KEY=${get('FINNHUB_API_KEY')}
`

writeFileSync(envPath, envContent)
console.log('Updated .env.local')

const vars = [
  ['VITE_SUPABASE_ANON_KEY', anon],
  ['SUPABASE_ANON_KEY', anon],
  ['SUPABASE_SERVICE_ROLE_KEY', serviceRole],
]

for (const [name, value] of vars) {
  for (const env of ['production', 'preview', 'development']) {
    try {
      execSync(`printf '%s' '${value.replace(/'/g, "'\\''")}' | ${vercel} env add ${name} ${env}`, {
        cwd: root,
        stdio: 'pipe',
      })
      console.log(`Set ${name} (${env})`)
    } catch (e) {
      const msg = String(e.stderr ?? e.stdout ?? '')
      if (msg.includes('already exists')) {
        execSync(
          `printf '%s' '${value.replace(/'/g, "'\\''")}' | ${vercel} env rm ${name} ${env} -y && printf '%s' '${value.replace(/'/g, "'\\''")}' | ${vercel} env add ${name} ${env}`,
          { cwd: root, stdio: 'pipe' }
        )
        console.log(`Updated ${name} (${env})`)
      } else {
        console.warn(`Skip ${name} ${env}:`, msg.slice(0, 120))
      }
    }
  }
}

console.log('Done.')
