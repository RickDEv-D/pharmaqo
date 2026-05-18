'use client'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { Shield, Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(formData)
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Erro ao criar conta')
    }
    setLoading(false)
  }

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-pharma-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-pharma-purple/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pharma-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pharma-purple to-pharma-purple-dark flex items-center justify-center shadow-glow">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">PharmaQo</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Criar Conta</h1>
          <p className="text-pharma-text-muted">Junte-se ao PharmaQo</p>
        </div>

        <div className="card glow-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-pharma-danger/10 border border-pharma-danger/30 text-pharma-danger text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input type="text" value={formData.name} onChange={e => update('name', e.target.value)}
                  className="input-field pl-10" placeholder="Seu nome" required />
              </div>
            </div>

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input type="email" value={formData.email} onChange={e => update('email', e.target.value)}
                  className="input-field pl-10" placeholder="seu@email.com" required />
              </div>
            </div>

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input type="tel" value={formData.phone} onChange={e => update('phone', e.target.value)}
                  className="input-field pl-10" placeholder="(11) 99999-9999" />
              </div>
            </div>

            <div>
              <label className="text-sm text-pharma-text-muted mb-1 block">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={e => update('password', e.target.value)}
                  className="input-field pl-10 pr-10" placeholder="••••••••" required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pharma-text-muted hover:text-pharma-purple">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Criar Conta <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-pharma-text-muted">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-pharma-purple hover:underline font-semibold">Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
