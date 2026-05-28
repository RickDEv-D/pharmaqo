'use client'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { formatCurrency, FREIGHT_TABLE } from '@/lib/utils'
import { Truck, Save } from 'lucide-react'

export default function AdminFreightPage() {
  const [freights, setFreights] = useState<Record<string, { price: number; days: number }>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch('/api/freight', { headers })
      .then(r => r.json())
      .then(d => {
        const map: Record<string, { price: number; days: number }> = { ...FREIGHT_TABLE }
        ;(d.freights || []).forEach((f: any) => { map[f.state] = { price: f.price, days: f.days } })
        setFreights(map)
      })
      .catch(() => setFreights({ ...FREIGHT_TABLE }))
  }, [])

  const updateFreight = async (state: string) => {
    setSaving(state)
    const f = freights[state]
    await fetch('/api/freight', {
      method: 'PUT', headers,
      body: JSON.stringify({ state, price: f.price, days: f.days }),
    })
    setSaving(null)
  }

  const updateValue = (state: string, field: 'price' | 'days', value: number) => {
    setFreights(prev => ({ ...prev, [state]: { ...prev[state], [field]: value } }))
  }

  const states = Object.keys(freights).sort()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Tabela de Fretes</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-pharma-border">
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Preço (R$)</th>
                <th className="text-left py-3 px-4 text-sm text-pharma-text-muted font-medium">Prazo (dias)</th>
                <th className="text-right py-3 px-4 text-sm text-pharma-text-muted font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {states.map(state => (
                <tr key={state} className="border-b border-pharma-border/50 hover:bg-pharma-bg/50">
                  <td className="py-3 px-4 font-bold text-pharma-purple">{state}</td>
                  <td className="py-3 px-4">
                    <input type="number" step="0.01" value={freights[state].price}
                      onChange={e => updateValue(state, 'price', parseFloat(e.target.value))}
                      className="input-field w-24 py-1 text-sm" />
                  </td>
                  <td className="py-3 px-4">
                    <input type="number" value={freights[state].days}
                      onChange={e => updateValue(state, 'days', parseInt(e.target.value))}
                      className="input-field w-20 py-1 text-sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => updateFreight(state)} disabled={saving === state}
                      className="p-2 rounded-lg hover:bg-pharma-purple/10 text-pharma-purple">
                      {saving === state ? (
                        <div className="w-4 h-4 border-2 border-pharma-purple/30 border-t-pharma-purple rounded-full animate-spin" />
                      ) : <Save className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
