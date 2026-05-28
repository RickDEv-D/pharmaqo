import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const where = user.role === 'admin' ? {} : { userId: user.userId }
  const chatRooms = await prisma.chatRoom.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      order: { select: { id: true, total: true, status: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: { sender: { select: { name: true, role: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ chatRooms })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  try {
    const body = await request.json()

    if (body.chatRoomId && body.content) {
      const message = await prisma.message.create({
        data: {
          chatRoomId: body.chatRoomId,
          senderId: user.userId,
          content: body.content,
          type: body.type || 'text',
        },
        include: { sender: { select: { name: true, role: true } } },
      })

      await prisma.chatRoom.update({
        where: { id: body.chatRoomId },
        data: { updatedAt: new Date() },
      })

      return NextResponse.json(message, { status: 201 })
    }

    const chatRoom = await prisma.chatRoom.create({
      data: {
        userId: user.userId,
        orderId: body.orderId || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: true,
      },
    })

    return NextResponse.json(chatRoom, { status: 201 })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Erro no chat' }, { status: 500 })
  }
}
