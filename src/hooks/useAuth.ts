'use client'
import { useState, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie'
import { UserData } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = Cookies.get('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        Cookies.remove('token')
        setUser(null)
      }
    } catch {
      setUser(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { checkAuth() }, [checkAuth])

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      Cookies.set('token', data.token, { expires: 7 })
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const register = async (userData: Record<string, string>) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    const data = await res.json()
    if (res.ok) {
      Cookies.set('token', data.token, { expires: 7 })
      setUser(data.user)
      return { success: true }
    }
    return { success: false, error: data.error }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
  }

  return { user, loading, login, register, logout, checkAuth }
}
