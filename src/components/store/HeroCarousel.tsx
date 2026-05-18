'use client'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Shield, Zap, QrCode } from 'lucide-react'
import Link from 'next/link'

const slides = [
  {
    title: 'PharmaQo Labs',
    subtitle: 'Tecnologia Farmacêutica Premium',
    description: 'Produtos autenticados com QRCode anti-fraude. Qualidade garantida.',
    cta: 'Ver Produtos',
    ctaLink: '/products',
    icon: Shield,
    gradient: 'from-purple-900/50 to-pharma-bg',
  },
  {
    title: 'Autenticação Anti-Fraude',
    subtitle: 'Cada produto é único',
    description: 'Verifique a autenticidade dos seus produtos com nosso sistema de QRCode exclusivo.',
    cta: 'Verificar Agora',
    ctaLink: '/verify',
    icon: QrCode,
    gradient: 'from-violet-900/50 to-pharma-bg',
  },
  {
    title: 'Novos Lançamentos',
    subtitle: 'Produtos de última geração',
    description: 'Descubra os mais recentes avanços em tecnologia farmacêutica.',
    cta: 'Explorar',
    ctaLink: '/products',
    icon: Zap,
    gradient: 'from-indigo-900/50 to-pharma-bg',
  },
]

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="relative overflow-hidden rounded-2xl border border-pharma-border">
      <div className={`bg-gradient-to-r ${slide.gradient} min-h-[400px] md:min-h-[500px] flex items-center transition-all duration-700`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pharma-purple/5 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-pharma-purple/10 rounded-full blur-2xl animate-float" />
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-pharma-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-12 flex items-center gap-12 w-full">
          <div className="flex-1">
            <span className="text-pharma-purple font-semibold text-sm uppercase tracking-widest mb-2 block">
              {slide.subtitle}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text leading-tight">
              {slide.title}
            </h1>
            <p className="text-pharma-text-muted text-lg mb-8 max-w-lg">
              {slide.description}
            </p>
            <Link href={slide.ctaLink} className="btn-primary inline-flex items-center gap-2">
              {slide.cta}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-48 h-48 rounded-3xl bg-pharma-purple/10 border border-pharma-purple/20 flex items-center justify-center animate-float shadow-glow-lg">
              <Icon className="w-24 h-24 text-pharma-purple" />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setCurrent((current - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-pharma-card/80 backdrop-blur flex items-center justify-center hover:bg-pharma-purple transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-pharma-card/80 backdrop-blur flex items-center justify-center hover:bg-pharma-purple transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === current ? 'w-8 bg-pharma-purple' : 'bg-pharma-text-muted/30'}`}
          />
        ))}
      </div>
    </div>
  )
}
