'use client'
import { useCart } from '@/hooks/useCart'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import { formatCurrency } from '@/lib/utils'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total, loaded } = useCart()

  if (!loaded) return null

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold gradient-text mb-8">Carrinho</h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-pharma-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
              <p className="text-pharma-text-muted mb-6">Adicione produtos para continuar</p>
              <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                Ver Produtos <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {items.map(item => (
                  <div key={item.productId} className="card-hover flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-pharma-bg overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.name}</h3>
                      <p className="text-pharma-purple font-bold">{formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-pharma-bg rounded-lg border border-pharma-border p-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-pharma-card">
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded flex items-center justify-center hover:bg-pharma-card">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.productId)}
                        className="p-2 rounded-lg text-pharma-danger hover:bg-pharma-danger/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className="font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card h-fit sticky top-24">
                <h3 className="font-semibold text-lg mb-4">Resumo</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-muted">Subtotal</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-pharma-text-muted">Frete</span>
                    <span className="text-pharma-text-muted">Calculado no checkout</span>
                  </div>
                  <div className="border-t border-pharma-border pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-pharma-purple">{formatCurrency(total)}</span>
                  </div>
                </div>
                <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
                  Finalizar Pedido <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
