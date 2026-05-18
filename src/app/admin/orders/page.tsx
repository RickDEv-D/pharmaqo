'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import Link from 'next/link'

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-400/10', icon: Clock },
  processing: { label: 'Processando', color: 'text-blue-400 bg-blue-400/10', icon: ShoppingCart },
  shipped: { label: 'Enviado', color: 'text-purple-400 bg-purple-400/10', icon: Truck },
  completed: { label: 'Concluído', color: 'text-green-400 bg-green-400/10', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-red-400 bg-red-400/10', icon: XCircle },
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch('/api/orders', { headers })
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT', headers,
      body: JSON.stringify({ status }),
    })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Pedidos</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pharma-border">
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Pedido</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Itens</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Total</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Data</th>
                <th className="text-right py-3 px-4 text-sm text-pharma-text-muted font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => {
                const st = statusMap[order.status] || statusMap.pending
                return (
                  <tr key={order.id} className="border-b border-pharma-border/50 hover:bg-pharma-bg/50">
                    <td className="py-3 px-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-sm">{order.user?.name}</p>
                      <p className="text-xs text-pharma-text-muted">{order.user?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">{order.items?.length || 0} itens</td>
                    <td className="py-3 px-4 font-bold text-pharma-purple">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        className="input-field py-1 px-2 text-xs"
                      >
                        {Object.entries(statusMap).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-sm text-pharma-text-muted">
                      {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/chat?orderId=${order.id}`} className="p-2 rounded-lg hover:bg-pharma-purple/10 text-pharma-purple inline-flex">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {orders.length === 0 && !loading && (
            <p className="text-center py-8 text-pharma-text-muted">Nenhum pedido encontrado</p>
          )}
        </div>
      </div>
    </div>
  )
}
