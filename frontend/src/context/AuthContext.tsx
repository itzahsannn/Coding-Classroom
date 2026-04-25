import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  role: 'student' | 'instructor' | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, name: string, role: 'student' | 'instructor') => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        role: (session?.user?.user_metadata?.role as 'student' | 'instructor') ?? null,
        loading: false,
      })
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        role: (session?.user?.user_metadata?.role as 'student' | 'instructor') ?? null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string, role: 'student' | 'instructor') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    })
    return { error: error?.message ?? null }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
