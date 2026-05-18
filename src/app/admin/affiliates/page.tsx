'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { formatCurrency } from '@/lib/utils'
import { Users, Plus, Tag, X } from 'lucide-react'

export default function AdminAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<any[]>([])
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({ code: '', discount: '', type: 'percentage', maxUses: '', affiliateId: '' })

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    Promise.all([
      fetch('/api/coupons', { headers }).then(r => r.json()),
    ]).then(([couponData]) => {
      setCoupons(couponData.coupons || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/coupons', { method: 'POST', headers, body: JSON.stringify(couponForm) })
    const data = await fetch('/api/coupons', { headers }).then(r => r.json())
    setCoupons(data.coupons || [])
    setShowCouponModal(false)
    setCouponForm({ code: '', discount: '', type: 'percentage', maxUses: '', affiliateId: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Afiliados & Cupons</h1>
        <button onClick={() => setShowCouponModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Cupom
        </button>
      </div>

      <div className="card overflow-hidden">
        <h2 className="font-semibold text-lg mb-4 px-4 pt-4">Cupons de Desconto</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pharma-border">
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Código</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Desconto</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Tipo</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Usos</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id} className="border-b border-pharma-border/50 hover:bg-pharma-bg/50">
                  <td className="py-3 px-4 font-mono font-bold text-pharma-purple">{coupon.code}</td>
                  <td className="py-3 px-4">
                    {coupon.type === 'percentage' ? `${coupon.discount}%` : formatCurrency(coupon.discount)}
                  </td>
                  <td className="py-3 px-4 text-sm capitalize">{coupon.type === 'percentage' ? 'Percentual' : 'Valor Fixo'}</td>
                  <td className="py-3 px-4 text-sm">
                    {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ''}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${coupon.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && !loading && (
            <div className="text-center py-12 text-pharma-text-muted">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cupom criado</p>
            </div>
          )}
        </div>
      </div>

      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Novo Cupom</h2>
              <button onClick={() => setShowCouponModal(false)} className="p-2 rounded-lg hover:bg-pharma-bg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createCoupon} className="space-y-4">
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">Código</label>
                <input type="text" value={couponForm.code} onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  className="input-field" required placeholder="PROMO20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Desconto</label>
                  <input type="number" step="0.01" value={couponForm.discount}
                    onChange={e => setCouponForm(p => ({ ...p, discount: e.target.value }))}
                    className="input-field" required />
                </div>
                <div>
                  <label className="text-sm text-pharma-text-muted mb-1 block">Tipo</label>
                  <select value={couponForm.type} onChange={e => setCouponForm(p => ({ ...p, type: e.target.value }))}
                    className="input-field">
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-pharma-text-muted mb-1 block">Limite de Usos (vazio = ilimitado)</label>
                <input type="number" value={couponForm.maxUses} onChange={e => setCouponForm(p => ({ ...p, maxUses: e.target.value }))}
                  className="input-field" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCouponModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Criar Cupom</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
