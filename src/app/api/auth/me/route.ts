import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const payload = getUserFromRequest(request)
  if (!payload) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, name: true, email: true, role: true, phone: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
