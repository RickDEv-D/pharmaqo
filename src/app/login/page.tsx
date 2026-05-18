'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Erro ao fazer login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-pharma-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pharma-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pharma-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pharma-purple to-pharma-purple-dark flex items-center justify-center shadow-glow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PharmaQo</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Bem-vindo de volta</h1>
          <p className="text-pharma-text-muted">Acesse sua conta para continuar</p>
        </div>

        <div className="card glow-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-pharma-danger/10 border border-pharma-danger/30 text-pharma-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pharma-text-muted hover:text-pharma-purple"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-pharma-text-muted">
            Não tem uma conta?{' '}
            <Link href="/register" className="text-pharma-purple hover:underline font-semibold">
              Criar conta
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-pharma-text-muted">
          <p>Demo: admin@pharmaqo.com / admin123</p>
        </div>
      </div>
    </div>
  )
}
