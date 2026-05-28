"use client"
import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/ui/Navbar"
import { useAuth } from "@/hooks/useAuth"
import Cookies from "js-cookie"
import { Send, MessageCircle, ArrowLeft, Package, Smile, Bell, ShoppingCart, MapPin, CreditCard, CheckCircle } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

const EMOJI_LIST = ["\u{1F600}","\u{1F602}","\u{1F60A}","\u{1F60D}","\u{1F970}","\u{1F60E}","\u{1F929}","\u{1F607}","\u{1F64F}","\u{1F44D}","\u{1F44F}","\u{1F4AA}","\u{1F389}","\u{1F525}","\u2764\uFE0F","\u{1F49C}","\u{1F499}","\u{1F49A}","\u2728","\u2B50","\u{1F3C6}","\u{1F48E}","\u{1F48A}","\u{1F489}","\u{1F9EA}","\u{1F52C}","\u{1F4E6}","\u{1F69A}","\u2705","\u274C","\u26A0\uFE0F","\u{1F514}","\u{1F4AC}","\u{1F4CB}","\u{1F4B0}","\u{1F6D2}"]

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
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const prevMessageCountRef = useRef<number>(0)

  const token = Cookies.get("token")
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  useEffect(() => {
    if (user) loadChatRooms()
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [user])

  useEffect(() => {
    const orderId = searchParams.get("orderId")
    if (orderId && user) createOrFindChat(orderId)
  }, [searchParams, user])

  const showNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/images/placeholder.svg" })
    }
  }

  const loadChatRooms = async () => {
    try {
      const res = await fetch("/api/chat", { headers })
      const data = await res.json()
      setChatRooms(data.chatRooms || [])
      setLoading(false)
    } catch { setLoading(false) }
  }

  const createOrFindChat = async (orderId: string) => {
    try {
      const res = await fetch("/api/chat", { headers })
      const data = await res.json()
      const existing = (data.chatRooms || []).find((r: any) => r.orderId === orderId)
      if (existing) {
        openChat(existing.id)
      } else {
        const createRes = await fetch("/api/chat", {
          method: "POST", headers,
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
      prevMessageCountRef.current = (data.messages || []).length
      setUnreadCounts(prev => ({ ...prev, [chatRoomId]: 0 }))
      scrollToBottom()

      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/chat/${chatRoomId}`, { headers })
          const d = await r.json()
          const newMsgs = d.messages || []
          if (newMsgs.length > prevMessageCountRef.current) {
            const latest = newMsgs[newMsgs.length - 1]
            if (latest.senderId !== user?.id) {
              showNotification(
                `Nova mensagem de ${latest.sender?.name || "Atendimento"}`,
                latest.content.length > 50 ? latest.content.slice(0, 50) + "..." : latest.content
              )
            }
            prevMessageCountRef.current = newMsgs.length
          }
          setMessages(newMsgs)
          scrollToBottom()
        } catch { /* ignore */ }
      }, 3000)
    } catch { /* ignore */ }
  }

  const sendMessage = async (content?: string) => {
    const msgContent = content || newMessage
    if (!msgContent.trim() || !activeChat || sending) return
    setSending(true)
    try {
      await fetch("/api/chat", {
        method: "POST", headers,
        body: JSON.stringify({ chatRoomId: activeChat.id, content: msgContent }),
      })
      setNewMessage("")
      setShowEmoji(false)
      const res = await fetch(`/api/chat/${activeChat.id}`, { headers })
      const data = await res.json()
      setMessages(data.messages || [])
      prevMessageCountRef.current = (data.messages || []).length
      scrollToBottom()
      loadChatRooms()
    } catch { /* ignore */ }
    setSending(false)
  }

  const sendOrderSummary = () => {
    if (!activeChat?.order) return
    const order = activeChat.order
    const items = order.items?.map((i: any) => `\u2022 ${i.product?.name} x${i.quantity} - ${formatCurrency(i.total)}`).join("\n")
    const summary = `\u{1F4CB} *RESUMO DO PEDIDO #${order.id.slice(0, 8)}*\n\n${items}\n\n\u{1F4B0} Subtotal: ${formatCurrency(order.subtotal)}\n\u{1F69A} Frete: ${formatCurrency(order.freight)}\n${order.discount > 0 ? `\u{1F3F7}\uFE0F Desconto: -${formatCurrency(order.discount)}\n` : ""}\u{1F48E} Total: ${formatCurrency(order.total)}\n\n${order.notes ? `\u{1F4CD} ${order.notes}` : ""}`
    sendMessage(summary)
  }

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
  }

  const formatMessageContent = (content: string) => {
    let formatted = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    formatted = formatted.replace(/\*([^*]+)\*/g, "<strong>$1</strong>")
    formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>")
    formatted = formatted.replace(/~([^~]+)~/g, "<s>$1</s>")
    return formatted
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-pharma-bg">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <div className="text-center card p-8">
            <MessageCircle className="w-12 h-12 text-pharma-purple mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Fa&ccedil;a login para acessar o chat</h2>
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
        <div className={`w-full md:w-80 border-r border-pharma-border bg-pharma-card flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-pharma-border flex items-center justify-between">
            <h2 className="font-bold text-lg">Mensagens</h2>
            <Bell className="w-5 h-5 text-pharma-purple" />
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
                    activeChat?.id === room.id ? "bg-pharma-purple/10 border-l-2 border-l-pharma-purple" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pharma-purple/20 flex items-center justify-center flex-shrink-0 relative">
                      {room.order ? <Package className="w-5 h-5 text-pharma-purple" /> : <MessageCircle className="w-5 h-5 text-pharma-purple" />}
                      {(unreadCounts[room.id] || 0) > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                          {unreadCounts[room.id]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {user.role === "admin" ? room.user.name : (room.order ? `Pedido #${room.order.id.slice(0, 8)}` : "Atendimento")}
                      </p>
                      <p className="text-xs text-pharma-text-muted truncate">
                        {room.messages[0]?.content || "Sem mensagens"}
                      </p>
                    </div>
                    {room.order && (
                      <div className="text-right">
                        <span className="text-xs text-pharma-purple font-semibold block">
                          {formatCurrency(room.order.total)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          room.order.status === "completed" ? "bg-green-500/20 text-green-400" :
                          room.order.status === "processing" ? "bg-blue-500/20 text-blue-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {room.order.status === "pending" ? "Pendente" : room.order.status === "processing" ? "Processando" : room.order.status === "completed" ? "Conclu\u00EDdo" : room.order.status}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col ${!activeChat ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-pharma-border bg-pharma-card flex items-center gap-3">
                <button onClick={() => { setActiveChat(null); if (pollRef.current) clearInterval(pollRef.current) }} className="md:hidden p-2 rounded-lg hover:bg-pharma-bg">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-pharma-purple/20 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-pharma-purple" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    {user.role === "admin" ? activeChat.user?.name : "Atendimento PharmaQo"}
                  </p>
                  {activeChat.order && (
                    <p className="text-xs text-pharma-text-muted">
                      Pedido #{activeChat.order.id.slice(0, 8)} - {formatCurrency(activeChat.order.total)}
                    </p>
                  )}
                </div>
                {activeChat.order && (
                  <button onClick={() => setShowOrderDetails(!showOrderDetails)} className="p-2 rounded-lg hover:bg-pharma-bg transition-colors" title="Ver detalhes do pedido">
                    <Package className="w-5 h-5 text-pharma-purple" />
                  </button>
                )}
              </div>

              {showOrderDetails && activeChat.order && (
                <div className="p-4 bg-pharma-purple/5 border-b border-pharma-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-pharma-purple" /> Detalhes do Pedido
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      activeChat.order.status === "completed" ? "bg-green-500/20 text-green-400" : activeChat.order.status === "processing" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {activeChat.order.status === "pending" ? "Pendente" : activeChat.order.status === "processing" ? "Processando" : activeChat.order.status === "completed" ? "Conclu\u00EDdo" : activeChat.order.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {activeChat.order.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm bg-pharma-bg/50 rounded-lg p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-pharma-purple font-mono text-xs">x{item.quantity}</span>
                          <span>{item.product?.name}</span>
                        </div>
                        <span className="font-semibold">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-pharma-border pt-2 space-y-1 text-sm">
                    <div className="flex justify-between"><span className="text-pharma-text-muted">Subtotal</span><span>{formatCurrency(activeChat.order.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-pharma-text-muted">Frete</span><span>{formatCurrency(activeChat.order.freight)}</span></div>
                    {activeChat.order.discount > 0 && <div className="flex justify-between text-green-400"><span>Desconto</span><span>-{formatCurrency(activeChat.order.discount)}</span></div>}
                    <div className="flex justify-between font-bold text-pharma-purple"><span>Total</span><span>{formatCurrency(activeChat.order.total)}</span></div>
                  </div>
                  {activeChat.order.notes && (
                    <div className="flex items-start gap-2 text-xs text-pharma-text-muted bg-pharma-bg/50 rounded-lg p-2">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /><span>{activeChat.order.notes}</span>
                    </div>
                  )}
                  {user.role === "admin" && (
                    <div className="flex gap-2">
                      <button onClick={sendOrderSummary} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                        <CreditCard className="w-3 h-3" /> Enviar Resumo
                      </button>
                      <button onClick={() => sendMessage("\u2705 Pagamento confirmado! Seu pedido est\u00E1 sendo processado.")} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Confirmar Pagamento
                      </button>
                    </div>
                  )}
                </div>
              )}

              {messages.length === 0 && activeChat.order && (
                <div className="p-4 bg-pharma-purple/5 border-b border-pharma-border">
                  <div className="text-center text-sm text-pharma-text-muted">
                    <Package className="w-8 h-8 text-pharma-purple mx-auto mb-2" />
                    <p className="font-semibold text-pharma-text mb-1">Pedido criado com sucesso! {"\u{1F389}"}</p>
                    <p>Um atendente ir&aacute; entrar em contato para finalizar o pagamento.</p>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.senderId === user.id
                        ? "bg-pharma-purple text-white rounded-br-md"
                        : "bg-pharma-card border border-pharma-border rounded-bl-md"
                    }`}>
                      {msg.sender && msg.senderId !== user.id && (
                        <p className="text-xs font-semibold text-pharma-purple mb-1">{msg.sender.name}</p>
                      )}
                      <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                      <p className={`text-xs mt-1 ${msg.senderId === user.id ? "text-white/60" : "text-pharma-text-muted"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-pharma-border bg-pharma-card">
                {showEmoji && (
                  <div className="mb-3 p-3 bg-pharma-bg rounded-xl border border-pharma-border">
                    <div className="grid grid-cols-9 gap-1">
                      {EMOJI_LIST.map(emoji => (
                        <button key={emoji} onClick={() => setNewMessage(prev => prev + emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-pharma-card rounded-lg transition-colors">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2 text-xs text-pharma-text-muted">
                  <span>{"Formata\u00E7\u00E3o: *negrito* _it\u00E1lico_ ~riscado~"}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowEmoji(!showEmoji)}
                    className={`p-2.5 rounded-xl transition-colors ${showEmoji ? "bg-pharma-purple text-white" : "bg-pharma-bg hover:bg-pharma-card text-pharma-text-muted"}`}>
                    <Smile className="w-5 h-5" />
                  </button>
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendMessage()}
                    className="input-field flex-1" placeholder="Digite sua mensagem..." />
                  <button onClick={() => sendMessage()} disabled={sending || !newMessage.trim()} className="btn-primary px-4">
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
