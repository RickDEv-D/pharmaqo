'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { formatCurrency } from '@/lib/utils'
import {
  Package, ShoppingCart, Users, QrCode, DollarSign, AlertTriangle,
  TrendingUp, Clock, ArrowUpRight
} from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get('token')
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}

  const statCards = [
    { label: 'Receita Total', value: formatCurrency(stats.totalRevenue || 0), icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Pedidos', value: stats.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Produtos', value: stats.totalProducts || 0, icon: Package, color: 'text-pharma-purple', bg: 'bg-pharma-purple/10' },
    { label: 'Clientes', value: stats.totalUsers || 0, icon: Users, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { label: 'Verificações QR', value: stats.totalVerifications || 0, icon: QrCode, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Pedidos Pendentes', value: stats.pendingOrders || 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Scans Suspeitos', value: stats.suspiciousScans || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Crescimento', value: '+12%', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
        <span className="text-sm text-pharma-text-muted">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="card-hover group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-pharma-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-2xl font-bold mb-1">{card.value}</p>
            <p className="text-sm text-pharma-text-muted">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Pedidos Recentes</h2>
            <Link href="/admin/orders" className="text-pharma-purple text-sm hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentOrders || []).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-pharma-bg">
                <div>
                  <p className="font-semibold text-sm">#{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-pharma-text-muted">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-pharma-purple">{formatCurrency(order.total)}</p>
                  <span className={`badge text-xs ${
                    order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                    order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-pharma-text-muted/20 text-pharma-text-muted'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
            {(!data?.recentOrders || data.recentOrders.length === 0) && (
              <p className="text-pharma-text-muted text-sm text-center py-4">Nenhum pedido ainda</p>
            )}
          </div>
        </div>

        {/* Recent QR Verifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Verificações QR Recentes</h2>
            <Link href="/admin/verifications" className="text-pharma-purple text-sm hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {(data?.recentVerifications || []).map((v: any) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-pharma-bg">
                <div>
                  <p className="font-semibold text-sm">{v.product?.name}</p>
                  <p className="text-xs text-pharma-text-muted font-mono">{v.product?.uid}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-pharma-text-muted">{new Date(v.createdAt).toLocaleDateString('pt-BR')}</p>
                  {v.suspicious && <span className="badge bg-red-500/20 text-red-400">Suspeito</span>}
                </div>
              </div>
            ))}
            {(!data?.recentVerifications || data.recentVerifications.length === 0) && (
              <p className="text-pharma-text-muted text-sm text-center py-4">Nenhuma verificação ainda</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
