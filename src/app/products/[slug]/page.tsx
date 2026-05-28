'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ProductCard from '@/components/store/ProductCard'
import { useCart } from '@/hooks/useCart'
import { formatCurrency } from '@/lib/utils'
import { ShoppingCart, Shield, QrCode, Minus, Plus, ArrowLeft, Package, Beaker, Star } from 'lucide-react'
import Link from 'next/link'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [related, setRelated] = useState<any[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then(r => r.json())
      .then(d => {
        setProduct(d.product)
        setRelated(d.related || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-pharma-bg">
        <Navbar />
        <div className="pt-24 max-w-7xl mx-auto px-4 animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-pharma-card rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-pharma-card rounded w-3/4" />
              <div className="h-6 bg-pharma-card rounded w-1/2" />
              <div className="h-20 bg-pharma-card rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-pharma-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
          <Link href="/products" className="btn-primary">Ver Produtos</Link>
        </div>
      </div>
    )
  }

  const tags = product.tags ? product.tags.split(',').filter(Boolean) : []
  const images = product.images || []
  const currentImage = images[selectedImage]?.url || '/images/placeholder.svg'

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: images[0]?.url || '/images/placeholder.svg',
    })
  }

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-pharma-text-muted hover:text-pharma-purple mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-pharma-card border border-pharma-border mb-4">
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${currentImage})` }} />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        i === selectedImage ? 'border-pharma-purple shadow-glow-sm' : 'border-pharma-border'
                      }`}
                    >
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${img.url})` }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag: string) => (
                  <span key={tag} className="badge bg-pharma-purple/20 text-pharma-purple">{tag.trim()}</span>
                ))}
              </div>

              <span className="text-sm text-pharma-purple font-medium">{product.category?.name}</span>
              <h1 className="text-3xl font-bold mt-1 mb-4">{product.name}</h1>

              <div className="flex items-baseline gap-3 mb-6">
                {product.comparePrice && product.comparePrice > product.price && (
                  <span className="text-xl text-pharma-text-muted line-through">{formatCurrency(product.comparePrice)}</span>
                )}
                <span className="text-3xl font-bold text-pharma-purple">{formatCurrency(product.price)}</span>
              </div>

              <p className="text-pharma-text-muted mb-6 leading-relaxed">{product.description}</p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.dosage && (
                  <div className="card p-3">
                    <span className="text-xs text-pharma-text-muted">Dosagem</span>
                    <p className="font-semibold text-sm">{product.dosage}</p>
                  </div>
                )}
                {product.lot && (
                  <div className="card p-3">
                    <span className="text-xs text-pharma-text-muted">Lote</span>
                    <p className="font-semibold text-sm">{product.lot}</p>
                  </div>
                )}
                {product.expiry && (
                  <div className="card p-3">
                    <span className="text-xs text-pharma-text-muted">Validade</span>
                    <p className="font-semibold text-sm">{product.expiry}</p>
                  </div>
                )}
                <div className="card p-3">
                  <span className="text-xs text-pharma-text-muted">Estoque</span>
                  <p className={`font-semibold text-sm ${product.stock > 0 ? 'text-pharma-success' : 'text-pharma-danger'}`}>
                    {product.stock > 0 ? `${product.stock} disponíveis` : 'Esgotado'}
                  </p>
                </div>
              </div>

              {product.composition && (
                <div className="card p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className="w-4 h-4 text-pharma-purple" />
                    <span className="font-semibold text-sm">Composição</span>
                  </div>
                  <p className="text-sm text-pharma-text-muted">{product.composition}</p>
                </div>
              )}

              {product.benefits && (
                <div className="card p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-pharma-purple" />
                    <span className="font-semibold text-sm">Benefícios</span>
                  </div>
                  <p className="text-sm text-pharma-text-muted">{product.benefits}</p>
                </div>
              )}

              {/* Add to cart */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-3 bg-pharma-card rounded-xl border border-pharma-border p-1">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg hover:bg-pharma-bg flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="w-10 h-10 rounded-lg hover:bg-pharma-bg flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" /> Adicionar ao Carrinho
                  </button>
                </div>
              )}

              {/* Auth badge */}
              <div className="card glow-border p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pharma-purple/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-pharma-purple" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Produto Autenticado</p>
                  <p className="text-xs text-pharma-text-muted">UID: {product.uid}</p>
                </div>
                <Link href={`/verify?code=${product.uid}`} className="ml-auto btn-ghost text-xs text-pharma-purple">
                  Verificar
                </Link>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold gradient-text mb-6">Produtos Relacionados</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={() => addItem({
                    productId: p.id, name: p.name, price: p.price, quantity: 1,
                    image: p.images[0]?.url || '/images/placeholder.svg',
                  })} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
