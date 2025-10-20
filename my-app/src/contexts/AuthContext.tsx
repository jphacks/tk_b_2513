'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase, type User, type AuthState } from '@/lib/supabase'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 初期セッションを取得
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user as User || null)
      setLoading(false)
    }

    getInitialSession()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: 認証状態変更', { event, user: !!session?.user })
        setUser(session?.user as User || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: signIn開始', { email })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('AuthContext: signIn結果', { data: !!data, error: error?.message })
      
      if (error) {
        console.error('AuthContext: 認証エラー詳細', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        // エラーを確実に返す
        return { error }
      }
      
      return { error: null }
    } catch (err: any) {
      console.error('AuthContext: signIn例外', err)
      // すべてのエラーをキャッチして返す
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error }
  }

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
