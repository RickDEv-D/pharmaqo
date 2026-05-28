'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { QrCode, Shield, ShieldAlert, ShieldCheck, Search, AlertTriangle } from 'lucide-react'

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pharma-bg"><Navbar /><div className="pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-pharma-purple/30 border-t-pharma-purple rounded-full animate-spin" /></div></div>}>
      <VerifyContent />
    </Suspense>
  )
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const c = searchParams.get('code')
    if (c) { setCode(c); handleVerify(c) }
  }, [])

  const handleVerify = async (verifyCode?: string) => {
    const c = verifyCode || code
    if (!c.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: c.trim() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ valid: false, message: 'Erro ao verificar. Tente novamente.' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-pharma-purple/10 flex items-center justify-center animate-float">
              <QrCode className="w-10 h-10 text-pharma-purple" />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Verificar Autenticidade</h1>
            <p className="text-pharma-text-muted">
              Insira o código UID ou escaneie o QRCode do produto
            </p>
          </div>

          <div className="card glow-border mb-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pharma-text-muted" />
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  className="input-field pl-10 text-lg"
                  placeholder="PQ-XXXX-XXXX-XXXX"
                />
              </div>
              <button onClick={() => handleVerify()} disabled={loading} className="btn-primary whitespace-nowrap">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Verificar'}
              </button>
            </div>
          </div>

          {result && (
            <div className={`card animate-slide-up ${
              result.valid && !result.suspicious ? 'glow-border' : 
              result.suspicious ? 'border-pharma-warning' : 'border-pharma-danger'
            }`}>
              <div className="text-center mb-6">
                {result.valid && !result.suspicious ? (
                  <>
                    <ShieldCheck className="w-16 h-16 text-pharma-success mx-auto mb-3" />
                    <h2 className="text-2xl font-bold text-pharma-success">{result.message}</h2>
                  </>
                ) : result.suspicious ? (
                  <>
                    <ShieldAlert className="w-16 h-16 text-pharma-warning mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-pharma-warning">{result.message}</h2>
                    <div className="mt-3 p-3 rounded-xl bg-pharma-warning/10 border border-pharma-warning/30">
                      <div className="flex items-center gap-2 justify-center">
                        <AlertTriangle className="w-4 h-4 text-pharma-warning" />
                        <span className="text-sm text-pharma-warning">Verificações suspeitas detectadas ({result.scanCount} scans)</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield className="w-16 h-16 text-pharma-danger mx-auto mb-3" />
                    <h2 className="text-xl font-bold text-pharma-danger">{result.message}</h2>
                  </>
                )}
              </div>

              {result.product && (
                <div className="space-y-3 border-t border-pharma-border pt-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="card p-3">
                      <span className="text-xs text-pharma-text-muted">Produto</span>
                      <p className="font-semibold text-sm">{result.product.name}</p>
                    </div>
                    <div className="card p-3">
                      <span className="text-xs text-pharma-text-muted">Categoria</span>
                      <p className="font-semibold text-sm">{result.product.category}</p>
                    </div>
                    {result.product.lot && (
                      <div className="card p-3">
                        <span className="text-xs text-pharma-text-muted">Lote</span>
                        <p className="font-semibold text-sm">{result.product.lot}</p>
                      </div>
                    )}
                    {result.product.expiry && (
                      <div className="card p-3">
                        <span className="text-xs text-pharma-text-muted">Validade</span>
                        <p className="font-semibold text-sm">{result.product.expiry}</p>
                      </div>
                    )}
                    <div className="card p-3 col-span-2">
                      <span className="text-xs text-pharma-text-muted">UID</span>
                      <p className="font-mono text-sm text-pharma-purple">{result.product.uid}</p>
                    </div>
                  </div>
                  {result.scanCount && (
                    <p className="text-xs text-pharma-text-muted text-center">
                      Este produto foi verificado {result.scanCount} vez(es)
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
