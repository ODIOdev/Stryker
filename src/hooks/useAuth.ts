import { useCallback, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export type UserRole = 'user' | 'admin' | 'master_admin'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<UserRole>('user')
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const loadProfileRole = useCallback(async (userId: string) => {
    if (!supabase) return
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    setRole((data?.role as UserRole | undefined) ?? 'user')
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      if (data.session?.user) {
        void loadProfileRole(data.session.user.id)
      } else {
        setRole('user')
      }
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      if (nextSession?.user) {
        void loadProfileRole(nextSession.user.id)
      } else {
        setRole('user')
      }
    })

    return () => sub.subscription.unsubscribe()
  }, [loadProfileRole])

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    if (!supabase) throw new Error('Auth is not configured')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Auth is not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google' | 'apple') => {
    if (!supabase) throw new Error('Auth is not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  return {
    user,
    session,
    role,
    isMasterAdmin: role === 'master_admin',
    loading,
    isConfigured: isSupabaseConfigured,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
  }
}
