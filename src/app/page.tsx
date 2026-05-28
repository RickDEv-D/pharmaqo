'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import HeroCarousel from '@/components/store/HeroCarousel'
import ProductCard from '@/components/store/ProductCard'
import CategoryBar from '@/components/store/CategoryBar'
import { useCart } from '@/hooks/useCart'
import { Shield, QrCode, Truck, HeadphonesIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    fetch('/api/products?featured=true&limit=8')
      .then(r => r.json())
      .then(d => setFeaturedProducts(d.products || []))
      .catch(() => {})
    fetch('/api/products?limit=12')
      .then(r => r.json())
      .then(d => {
        setAllProducts(d.products || [])
        const cats = Array.from(
          new Map((d.products || []).map((p: any) => [p.category.id, p.category])).values()
        )
        setCategories(cats as any[])
      })
      .catch(() => {})
  }, [])

  const handleAddToCart = (product: any) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.url || '/images/placeholder.svg',
    })
  }

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="mb-12">
            <HeroCarousel />
          </section>

          {/* Features */}
          <section className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Shield, title: 'Anti-Fraude', desc: 'QRCode único' },
                { icon: QrCode, title: 'Autenticação', desc: 'Verificação instantânea' },
                { icon: Truck, title: 'Entrega Rápida', desc: 'Todo o Brasil' },
                { icon: HeadphonesIcon, title: 'Suporte 24h', desc: 'Chat persistente' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="card-hover text-center py-6 group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-pharma-purple/10 flex items-center justify-center group-hover:bg-pharma-purple/20 transition-colors">
                    <Icon className="w-6 h-6 text-pharma-purple" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{title}</h3>
                  <p className="text-xs text-pharma-text-muted">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Categories */}
          {categories.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4 gradient-text">Categorias</h2>
              <CategoryBar categories={categories} />
            </section>
          )}

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Destaques</h2>
                <Link href="/products?featured=true" className="text-pharma-purple text-sm flex items-center gap-1 hover:underline">
                  Ver todos <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          {allProducts.length > 0 && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold gradient-text">Todos os Produtos</h2>
                <Link href="/products" className="text-pharma-purple text-sm flex items-center gap-1 hover:underline">
                  Ver catálogo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {allProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* CTA Banner */}
          <section className="mb-16">
            <div className="card glow-border p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-pharma-purple/5 to-transparent" />
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                  Verifique a Autenticidade
                </h2>
                <p className="text-pharma-text-muted mb-6 max-w-lg mx-auto">
                  Cada produto PharmaQo possui um QRCode único. Escaneie e verifique a autenticidade instantaneamente.
                </p>
                <Link href="/verify" className="btn-primary inline-flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Verificar Produto
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
