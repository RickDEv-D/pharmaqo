'use client'
import Link from 'next/link'
import { Beaker, Pill, Syringe, FlaskConical, Microscope, TestTubes } from 'lucide-react'

const icons = [Beaker, Pill, Syringe, FlaskConical, Microscope, TestTubes]

interface CategoryBarProps {
  categories: { id: string; name: string; slug: string }[]
  activeSlug?: string
}

export default function CategoryBar({ categories, activeSlug }: CategoryBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href="/products"
        className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
          !activeSlug
            ? 'bg-pharma-purple text-white shadow-glow'
            : 'bg-pharma-card border border-pharma-border text-pharma-text-muted hover:border-pharma-purple/30'
        }`}
      >
        Todos
      </Link>
      {categories.map((cat, i) => {
        const Icon = icons[i % icons.length]
        return (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
              activeSlug === cat.slug
                ? 'bg-pharma-purple text-white shadow-glow'
                : 'bg-pharma-card border border-pharma-border text-pharma-text-muted hover:border-pharma-purple/30'
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.name}
          </Link>
        )
      })}
    </div>
  )
}
