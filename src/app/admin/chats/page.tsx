"use client"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import { MessageCircle, Package, ArrowRight, Bell } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default function AdminChatsPage() {
  const [chatRooms, setChatRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = Cookies.get("token")
    fetch("/api/chat", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setChatRooms(d.chatRooms || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold gradient-text">Chats</h1>
        <div className="flex items-center gap-2 text-sm text-pharma-text-muted">
          <Bell className="w-4 h-4" />
          <span>{chatRooms.length} conversas</span>
        </div>
      </div>

      <div className="grid gap-4">
        {chatRooms.map(room => (
          <Link key={room.id} href="/chat" className="card-hover flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pharma-purple/10 flex items-center justify-center relative">
              {room.order ? <Package className="w-6 h-6 text-pharma-purple" /> : <MessageCircle className="w-6 h-6 text-pharma-purple" />}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{room.user?.name}</p>
              <p className="text-sm text-pharma-text-muted">{room.user?.email}</p>
              {room.messages[0] && (
                <p className="text-xs text-pharma-text-muted mt-1 truncate">{room.messages[0].content}</p>
              )}
            </div>
            {room.order && (
              <div className="text-right">
                <p className="text-sm font-bold text-pharma-purple">{formatCurrency(room.order.total)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  room.order.status === "completed" ? "bg-green-500/20 text-green-400" :
                  room.order.status === "processing" ? "bg-blue-500/20 text-blue-400" :
                  "bg-yellow-500/20 text-yellow-400"
                }`}>{room.order.status === "pending" ? "Pendente" : room.order.status === "processing" ? "Processando" : room.order.status === "completed" ? "Conclu\u00EDdo" : room.order.status}</span>
              </div>
            )}
            <ArrowRight className="w-5 h-5 text-pharma-text-muted" />
          </Link>
        ))}
        {chatRooms.length === 0 && !loading && (
          <div className="text-center py-12 text-pharma-text-muted">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conversa encontrada</p>
          </div>
        )}
      </div>
    </div>
  )
}
