'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { QrCode, AlertTriangle, Shield } from 'lucide-react'

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setVerifications(d.recentVerifications || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Verificações QR</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pharma-border">
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Produto</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">UID</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">IP</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Scans</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {verifications.map(v => (
                <tr key={v.id} className="border-b border-pharma-border/50 hover:bg-pharma-bg/50">
                  <td className="py-3 px-4 font-semibold text-sm">{v.product?.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-pharma-purple">{v.product?.uid}</td>
                  <td className="py-3 px-4 text-sm text-pharma-text-muted">{v.ip || '-'}</td>
                  <td className="py-3 px-4 text-sm">{v.scanCount}</td>
                  <td className="py-3 px-4">
                    {v.suspicious ? (
                      <span className="badge bg-red-500/20 text-red-400 flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> Suspeito
                      </span>
                    ) : (
                      <span className="badge bg-green-500/20 text-green-400 flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" /> Normal
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-pharma-text-muted">
                    {new Date(v.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {verifications.length === 0 && !loading && (
            <div className="text-center py-12 text-pharma-text-muted">
              <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma verificação registrada</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
