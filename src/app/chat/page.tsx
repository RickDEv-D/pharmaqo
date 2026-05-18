'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/ui/Navbar'
import { useAuth } from '@/hooks/useAuth'
import Cookies from 'js-cookie'
import { Send, MessageCircle, Plus, ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-pharma-bg"><Navbar /><div className="pt-24 flex justify-center"><div className="w-8 h-8 border-2 border-pharma-purple/30 border-t-pharma-purple rounded-full animate-spin" /></div></div>}>
      <ChatContent />
    </Suspense>
  )
}

function ChatContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [activeChat, setActiveChat] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const token = Cookies.get('token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    if (user) loadChatRooms()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user])

  useEffect(() => {
    const orderId = searchParams.get('orderId')
    if (orderId && user) {
      createOrFindChat(orderId)
    }
  }, [searchParams, user])

  const loadChatRooms = async () => {
    try {
      const res = await fetch('/api/chat', { headers })
      const data = await res.json()
      setChatRooms(data.chatRooms || [])
      setLoading(false)
    } catch { setLoading(false) }
  }

  const createOrFindChat = async (orderId: string) => {
    try {
      const res = await fetch('/api/chat', { headers })
      const data = await res.json()
      const existing = (data.chatRooms || []).find((r: any) => r.orderId === orderId)
      if (existing) {
        openChat(existing.id)
      } else {
        const createRes = await fetch('/api/chat', {
          method: 'POST', headers,
          body: JSON.stringify({ orderId }),
        })
        const room = await createRes.json()
        openChat(room.id)
        loadChatRooms()
      }
    } catch { /* ignore */ }
  }

  const openChat = async (chatRoomId: string) => {
    try {
      const res = await fetch(`/api/chat/${chatRoomId}`, { headers })
      const data = await res.json()
      setActiveChat(data)
      setMessages(data.messages || [])
      scrollToBottom()

      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/chat/${chatRoomId}`, { headers })
          const d = await r.json()
          setMessages(d.messages || [])
        } catch { /* ignore */ }
      }, 3000)
    } catch { /* ignore */ }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat || sending) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST', headers,
        body: JSON.stringify({ chatRoomId: activeChat.id, content: newMessage }),
      })
      setNewMessage('')
      const res = await fetch(`/api/chat/${activeChat.id}`, { headers })
      const data = await res.json()
      setMessages(data.messages || [])
      scrollToBottom()
    } catch { /* ignore */ }
    setSending(false)
  }

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pharma-bg">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center card p-8">
            <MessageCircle className="w-12 h-12 text-pharma-purple mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Faça login para acessar o chat</h2>
            <Link href="/login" className="btn-primary mt-4 inline-block">Entrar</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-pharma-bg">
      <Navbar />
      <main className="pt-16 h-screen flex">
        {/* Sidebar */}
        <div className={`w-full md:w-80 border-r border-pharma-border bg-pharma-card flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-pharma-border">
            <h2 className="font-bold text-lg">Mensagens</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-16 bg-pharma-border rounded-xl animate-pulse" />)}
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="p-4 text-center text-pharma-text-muted text-sm">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                Nenhuma conversa ainda
              </div>
            ) : (
              chatRooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => openChat(room.id)}
                  className={`w-full p-4 text-left hover:bg-pharma-bg/50 transition-colors border-b border-pharma-border ${
                    activeChat?.id === room.id ? 'bg-pharma-purple/10 border-l-2 border-l-pharma-purple' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pharma-purple/20 flex items-center justify-center flex-shrink-0">
                      {room.order ? <Package className="w-5 h-5 text-pharma-purple" /> : <MessageCircle className="w-5 h-5 text-pharma-purple" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.role === 'admin' ? room.user.name : (room.order ? `Pedido #${room.order.id.slice(0, 8)}` : 'Atendimento')}
                      </p>
                      <p className="text-xs text-pharma-text-muted truncate">
                        {room.messages[0]?.content || 'Sem mensagens'}
                      </p>
                    </div>
                    {room.order && (
                      <span className="text-xs text-pharma-purple font-semibold">
                        {formatCurrency(room.order.total)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-pharma-border bg-pharma-card flex items-center gap-3">
                <button onClick={() => setActiveChat(null)} className="md:hidden p-2 rounded-lg hover:bg-pharma-bg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-pharma-purple/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-pharma-purple" />
                </div>
                <div>
                  <p className="font-semibold">
                    {user.role === 'admin' ? activeChat.user?.name : 'Atendimento PharmaQo'}
                  </p>
                  {activeChat.order && (
                    <p className="text-xs text-pharma-text-muted">
                      Pedido #{activeChat.order.id.slice(0, 8)} - {formatCurrency(activeChat.order.total)}
                    </p>
                  )}
                </div>
              </div>

              {activeChat.order && (
                <div className="p-3 bg-pharma-purple/5 border-b border-pharma-border">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="w-4 h-4 text-pharma-purple" />
                    <span className="text-pharma-text-muted">Itens do pedido:</span>
                    {activeChat.order.items?.map((item: any) => (
                      <span key={item.id} className="badge bg-pharma-purple/20 text-pharma-purple">
                        {item.product?.name} x{item.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      msg.senderId === user.id
                        ? 'bg-pharma-purple text-white rounded-br-md'
                        : 'bg-pharma-card border border-pharma-border rounded-bl-md'
                    }`}>
                      {msg.sender && msg.senderId !== user.id && (
                        <p className="text-xs font-semibold text-pharma-purple mb-1">{msg.sender.name}</p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === user.id ? 'text-white/60' : 'text-pharma-text-muted'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-pharma-border bg-pharma-card">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="input-field flex-1"
                    placeholder="Digite sua mensagem..."
                  />
                  <button onClick={sendMessage} disabled={sending || !newMessage.trim()}
                    className="btn-primary px-4">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-16 h-16 text-pharma-text-muted/30 mx-auto mb-4" />
                <p className="text-pharma-text-muted">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
