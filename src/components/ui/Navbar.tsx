"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { ShoppingCart, Menu, X, User, LogOut, Shield, MessageCircle, Search, Bell } from "lucide-react"
import Cookies from "js-cookie"

export default function Navbar() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [unreadChats, setUnreadChats] = useState(0)

  useEffect(() => {
    if (!user) return
    const token = Cookies.get("token")
    const checkUnread = async () => {
      try {
        const res = await fetch("/api/chat", { headers: { Authorization: `Bearer ${token}` } })
        const data = await res.json()
        const rooms = data.chatRooms || []
        let unread = 0
        for (const room of rooms) {
          if (room.messages && room.messages.length > 0) {
            const lastMsg = room.messages[0]
            if (lastMsg.sender?.role !== (user.role === "admin" ? "admin" : "customer")) {
              unread++
            }
          }
        }
        setUnreadChats(unread)
      } catch { /* ignore */ }
    }
    checkUnread()
    const interval = setInterval(checkUnread, 10000)
    return () => clearInterval(interval)
  }, [user])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pharma-bg/80 backdrop-blur-xl border-b border-pharma-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pharma-purple to-pharma-purple-dark flex items-center justify-center shadow-glow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text hidden sm:block">PharmaQo</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-pharma-text-muted hover:text-pharma-purple transition-colors">
              {"In\u00EDcio"}
            </Link>
            <Link href="/products" className="text-pharma-text-muted hover:text-pharma-purple transition-colors">
              Produtos
            </Link>
            <Link href="/verify" className="text-pharma-text-muted hover:text-pharma-purple transition-colors">
              Verificar QR
            </Link>
            {user && (
              <Link href="/chat" className="text-pharma-text-muted hover:text-pharma-purple transition-colors relative">
                <MessageCircle className="w-5 h-5" />
                {unreadChats > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold animate-pulse">
                    {unreadChats}
                  </span>
                )}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-pharma-text-muted hover:text-pharma-purple hover:bg-pharma-card transition-all"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-pharma-text-muted hover:text-pharma-purple hover:bg-pharma-card transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-pharma-purple rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {count}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "admin" && (
                  <Link href="/admin" className="btn-ghost text-sm hidden md:flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-pharma-card transition-all">
                    <div className="w-8 h-8 rounded-full bg-pharma-purple/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-pharma-purple" />
                    </div>
                    <span className="text-sm hidden md:block">{user.name.split(" ")[0]}</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 card opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link href="/chat" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pharma-bg text-sm">
                      <MessageCircle className="w-4 h-4" /> Mensagens
                      {unreadChats > 0 && <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">{unreadChats}</span>}
                    </Link>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-pharma-bg text-sm text-red-400 w-full"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4">
                Entrar
              </Link>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-pharma-text-muted hover:bg-pharma-card"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="py-3 border-t border-pharma-border animate-slide-down">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
                }
              }}
            >
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field"
                autoFocus
              />
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="md:hidden py-4 border-t border-pharma-border animate-slide-down">
            <div className="flex flex-col gap-2">
              <Link href="/" className="px-3 py-2 rounded-lg hover:bg-pharma-card" onClick={() => setMenuOpen(false)}>{"In\u00EDcio"}</Link>
              <Link href="/products" className="px-3 py-2 rounded-lg hover:bg-pharma-card" onClick={() => setMenuOpen(false)}>Produtos</Link>
              <Link href="/verify" className="px-3 py-2 rounded-lg hover:bg-pharma-card" onClick={() => setMenuOpen(false)}>Verificar QR</Link>
              {user && (
                <Link href="/chat" className="px-3 py-2 rounded-lg hover:bg-pharma-card flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                  Mensagens
                  {unreadChats > 0 && <span className="w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">{unreadChats}</span>}
                </Link>
              )}
              {user?.role === "admin" && <Link href="/admin" className="px-3 py-2 rounded-lg hover:bg-pharma-card text-pharma-purple" onClick={() => setMenuOpen(false)}>Painel Admin</Link>}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
