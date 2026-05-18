'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard, Package, ShoppingCart, MessageCircle, Tag, QrCode,
  Users, Truck, Image, Settings, Shield, ChevronLeft, ChevronRight, LogOut, Menu, X
} from 'lucide-react'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Produtos' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/admin/chats', icon: MessageCircle, label: 'Chats' },
  { href: '/admin/labels', icon: Tag, label: 'Etiquetas' },
  { href: '/admin/verifications', icon: QrCode, label: 'Verificações QR' },
  { href: '/admin/affiliates', icon: Users, label: 'Afiliados' },
  { href: '/admin/freight', icon: Truck, label: 'Fretes' },
  { href: '/admin/banners', icon: Image, label: 'Banners' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-pharma-bg flex items-center justify-center">
        <div className="card p-8 text-center">
          <Shield className="w-12 h-12 text-pharma-purple mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-pharma-text-muted mb-4">Faça login como administrador</p>
          <Link href="/login" className="btn-primary">Entrar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pharma-bg flex">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-pharma-card border border-pharma-border"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen z-40 transition-all duration-300 bg-pharma-card border-r border-pharma-border flex flex-col
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className={`p-4 border-b border-pharma-border flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharma-purple to-pharma-purple-dark flex items-center justify-center shadow-glow flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!collapsed && <span className="text-lg font-bold gradient-text">Admin</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-pharma-purple/10 text-pharma-purple border border-pharma-purple/20'
                    : 'text-pharma-text-muted hover:bg-pharma-bg hover:text-pharma-text'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-2 border-t border-pharma-border space-y-1">
          <Link href="/" className={`flex items-center gap-3 px-3 py-2 rounded-xl text-pharma-text-muted hover:bg-pharma-bg text-sm ${collapsed ? 'justify-center' : ''}`}>
            <Settings className="w-5 h-5" />
            {!collapsed && 'Voltar à Loja'}
          </Link>
          <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-pharma-danger hover:bg-pharma-danger/10 text-sm ${collapsed ? 'justify-center' : ''}`}>
            <LogOut className="w-5 h-5" />
            {!collapsed && 'Sair'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-full items-center justify-center py-2 rounded-xl text-pharma-text-muted hover:bg-pharma-bg"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
