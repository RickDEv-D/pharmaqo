'use client'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    tags: string
    images: { url: string; isPrimary: boolean }[]
    category: { name: string }
    stock: number
  }
  onAddToCart?: () => void
}

const tagStyles: Record<string, string> = {
  'NOVO': 'badge-novo',
  'MAIS VENDIDO': 'badge-mais-vendido',
  'COMBO': 'badge-combo',
  'OFERTA': 'badge-oferta',
  'LANÇAMENTO': 'badge-lancamento',
  'LIMITADO': 'badge-limitado',
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.images.find(i => i.isPrimary)?.url || product.images[0]?.url || '/images/placeholder.svg'
  const tags = product.tags ? product.tags.split(',').filter(Boolean) : []
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.comparePrice!) * 100) : 0

  return (
    <div className="group card-hover overflow-hidden flex flex-col">
      <div className="relative aspect-square bg-pharma-bg rounded-xl overflow-hidden mb-4">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${primaryImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pharma-bg/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {tags.map(tag => (
              <span key={tag} className={`badge ${tagStyles[tag.trim()] || 'bg-pharma-purple/20 text-pharma-purple'}`}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {hasDiscount && (
          <div className="absolute top-3 right-3 bg-pharma-danger rounded-lg px-2 py-1 text-xs font-bold">
            -{discountPct}%
          </div>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Link
            href={`/products/${product.slug}`}
            className="w-10 h-10 rounded-xl bg-pharma-card/90 backdrop-blur flex items-center justify-center hover:bg-pharma-purple transition-colors"
          >
            <Eye className="w-5 h-5" />
          </Link>
          {product.stock > 0 && onAddToCart && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart() }}
              className="w-10 h-10 rounded-xl bg-pharma-purple flex items-center justify-center hover:bg-pharma-purple-dark transition-colors shadow-glow"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <span className="text-xs text-pharma-purple font-medium mb-1">{product.category.name}</span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-pharma-text group-hover:text-pharma-purple transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <div>
            {hasDiscount && (
              <span className="text-sm text-pharma-text-muted line-through mr-2">
                {formatCurrency(product.comparePrice!)}
              </span>
            )}
            <span className="text-lg font-bold text-pharma-purple">{formatCurrency(product.price)}</span>
          </div>
          {product.stock <= 0 && (
            <span className="text-xs text-pharma-danger font-medium">Esgotado</span>
          )}
        </div>
      </div>
    </div>
  )
}
