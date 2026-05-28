import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      items: { include: { product: { include: { images: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      chatRoom: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 })
  if (user.role !== 'admin' && order.userId !== user.userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json(order)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
    include: { items: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(order)
}
