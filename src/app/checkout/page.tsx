'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils'
import Cookies from 'js-cookie'
import { MapPin, Truck, Tag, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [address, setAddress] = useState<any>(null)
  const [freight, setFreight] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [addressForm, setAddressForm] = useState({
    street: '', number: '', complement: '', neighborhood: '', city: '', state: '', zipCode: '',
  })

  const calculateFreight = async () => {
    if (!zipCode || zipCode.replace(/\D/g, '').length < 8) return
    try {
      const res = await fetch('/api/freight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode }),
      })
      const data = await res.json()
      if (data.address) {
        setAddress(data.address)
        setAddressForm(prev => ({
          ...prev,
          street: data.address.street || '',
          neighborhood: data.address.neighborhood || '',
          city: data.address.city || '',
          state: data.address.state || '',
          zipCode: zipCode.replace(/\D/g, ''),
        }))
      }
      if (data.freight) setFreight(data.freight)
    } catch { /* ignore */ }
  }

  const validateCoupon = async () => {
    setCouponError('')
    setCoupon(null)
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      })
      const data = await res.json()
      if (data.valid) {
        setCoupon(data)
      } else {
        setCouponError(data.error || 'Cupom inválido')
      }
    } catch {
      setCouponError('Erro ao validar cupom')
    }
  }

  const discount = coupon
    ? coupon.type === 'percentage' ? total * (coupon.discount / 100) : coupon.discount
    : 0
  const freightCost = freight?.price || 0
  const grandTotal = total - discount + freightCost

  const handleSubmit = async () => {
    if (!user) { router.push('/login'); return }
    setLoading(true)

    try {
      const token = Cookies.get('token')
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: coupon?.code || null,
          notes: `Endereço: ${addressForm.street}, ${addressForm.number} - ${addressForm.neighborhood}, ${addressForm.city}/${addressForm.state} - CEP: ${addressForm.zipCode}`,
        }),
      })
      if (res.ok) {
        const order = await res.json()
        clearCart()
        router.push(`/chat?orderId=${order.id}`)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pharma-bg">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center card p-8">
            <h2 className="text-xl font-bold mb-4">Faça login para continuar</h2>
            <Link href="/login" className="btn-primary">Entrar</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold gradient-text mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Address */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-pharma-purple" />
                  <h2 className="font-semibold text-lg">Endereço de Entrega</h2>
                </div>
                <div className="flex gap-3 mb-4">
                  <input type="text" placeholder="CEP" value={zipCode}
                    onChange={e => setZipCode(e.target.value)} className="input-field flex-1" maxLength={9} />
                  <button onClick={calculateFreight} className="btn-secondary whitespace-nowrap">
                    Buscar CEP
                  </button>
                </div>
                {address && (
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Rua" value={addressForm.street}
                      onChange={e => setAddressForm(p => ({ ...p, street: e.target.value }))}
                      className="input-field col-span-2" />
                    <input type="text" placeholder="Número" value={addressForm.number}
                      onChange={e => setAddressForm(p => ({ ...p, number: e.target.value }))}
                      className="input-field" />
                    <input type="text" placeholder="Complemento" value={addressForm.complement}
                      onChange={e => setAddressForm(p => ({ ...p, complement: e.target.value }))}
                      className="input-field" />
                    <input type="text" placeholder="Bairro" value={addressForm.neighborhood}
                      onChange={e => setAddressForm(p => ({ ...p, neighborhood: e.target.value }))}
                      className="input-field" />
                    <input type="text" placeholder="Cidade" value={addressForm.city}
                      onChange={e => setAddressForm(p => ({ ...p, city: e.target.value }))}
                      className="input-field" readOnly />
                    <input type="text" placeholder="Estado" value={addressForm.state}
                      onChange={e => setAddressForm(p => ({ ...p, state: e.target.value }))}
                      className="input-field" readOnly />
                  </div>
                )}
              </div>

              {/* Freight */}
              {freight && (
                <div className="card">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-5 h-5 text-pharma-purple" />
                    <h2 className="font-semibold">Frete</h2>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm">Entrega para <strong>{freight.state}</strong></p>
                      <p className="text-xs text-pharma-text-muted">Prazo: {freight.days} dias úteis</p>
                    </div>
                    <span className="font-bold text-pharma-purple">{formatCurrency(freight.price)}</span>
                  </div>
                </div>
              )}

              {/* Coupon */}
              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-pharma-purple" />
                  <h2 className="font-semibold">Cupom de Desconto</h2>
                </div>
                <div className="flex gap-3">
                  <input type="text" placeholder="Código do cupom" value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())} className="input-field flex-1" />
                  <button onClick={validateCoupon} className="btn-secondary whitespace-nowrap">Aplicar</button>
                </div>
                {couponError && <p className="text-pharma-danger text-sm mt-2">{couponError}</p>}
                {coupon && (
                  <p className="text-pharma-success text-sm mt-2">
                    Cupom aplicado! {coupon.type === 'percentage' ? `${coupon.discount}% de desconto` : `${formatCurrency(coupon.discount)} de desconto`}
                  </p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="card h-fit sticky top-24">
              <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-pharma-text-muted truncate mr-2">{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-pharma-border pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-muted">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-pharma-success">
                      <span>Desconto</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-muted">Frete</span>
                    <span>{freightCost > 0 ? formatCurrency(freightCost) : '--'}</span>
                  </div>
                  <div className="border-t border-pharma-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-pharma-purple">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={loading || items.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Finalizar Pedido <ArrowRight className="w-5 h-5" /></>}
              </button>
              <p className="text-xs text-pharma-text-muted text-center mt-3">
                O pagamento será finalizado via chat com nosso atendimento
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
