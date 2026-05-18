'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ProductCard from '@/components/store/ProductCard'
import CategoryBar from '@/components/store/CategoryBar'
import { useCart } from '@/hooks/useCart'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pharma-bg"><Navbar /><div className="pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-pharma-purple/30 border-t-pharma-purple rounded-full animate-spin" /></div></div>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  const category = searchParams.get('category') || ''
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    params.set('page', String(page))
    params.set('limit', '12')

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => {
        setProducts(d.products || [])
        setPagination(d.pagination || { page: 1, pages: 1, total: 0 })
        const cats = Array.from(
          new Map((d.products || []).map((p: any) => [p.category.id, p.category])).values()
        )
        if (cats.length > 0 && categories.length === 0) setCategories(cats as any[])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [category, page, search])

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then(r => r.json())
      .then(d => {
        const cats = Array.from(
          new Map((d.products || []).map((p: any) => [p.category.id, p.category])).values()
        )
        setCategories(cats as any[])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Produtos</h1>
              <p className="text-pharma-text-muted mt-1">{pagination.total} produtos encontrados</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pharma-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="input-field pl-10 py-2 text-sm"
                />
              </div>
              <button className="p-2 rounded-xl bg-pharma-card border border-pharma-border hover:border-pharma-purple/30">
                <SlidersHorizontal className="w-5 h-5 text-pharma-text-muted" />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <CategoryBar categories={categories} activeSlug={category} />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-pharma-border rounded-xl mb-4" />
                  <div className="h-4 bg-pharma-border rounded mb-2 w-3/4" />
                  <div className="h-4 bg-pharma-border rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-pharma-text-muted text-lg">Nenhum produto encontrado</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image: product.images[0]?.url || '/images/placeholder.svg',
                    })}
                  />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <a
                    href={`/products?page=${Math.max(1, pagination.page - 1)}${category ? `&category=${category}` : ''}`}
                    className={`p-2 rounded-lg ${pagination.page <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-pharma-card'}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </a>
                  {Array.from({ length: pagination.pages }).map((_, i) => (
                    <a
                      key={i}
                      href={`/products?page=${i + 1}${category ? `&category=${category}` : ''}`}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all ${
                        pagination.page === i + 1
                          ? 'bg-pharma-purple text-white shadow-glow'
                          : 'hover:bg-pharma-card text-pharma-text-muted'
                      }`}
                    >
                      {i + 1}
                    </a>
                  ))}
                  <a
                    href={`/products?page=${Math.min(pagination.pages, pagination.page + 1)}${category ? `&category=${category}` : ''}`}
                    className={`p-2 rounded-lg ${pagination.page >= pagination.pages ? 'opacity-50 pointer-events-none' : 'hover:bg-pharma-card'}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
