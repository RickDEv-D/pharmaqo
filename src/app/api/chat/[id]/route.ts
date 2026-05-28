import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const chatRoom = await prisma.chatRoom.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { include: { items: { include: { product: { include: { images: true } } } }, address: true } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { sender: { select: { id: true, name: true, role: true } } },
      },
    },
  })

  if (!chatRoom) return NextResponse.json({ error: 'Chat não encontrado' }, { status: 404 })
  if (user.role !== 'admin' && chatRoom.userId !== user.userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json(chatRoom)
}
