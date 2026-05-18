import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

export async function PUT(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: {
      active: body.active,
      role: body.role,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  })

  return NextResponse.json(updated)
}
