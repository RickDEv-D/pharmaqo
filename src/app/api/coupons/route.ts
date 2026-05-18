import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const coupons = await prisma.coupon.findMany({
    include: { affiliate: { include: { user: { select: { name: true, email: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ coupons })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        discount: parseFloat(body.discount),
        type: body.type || 'percentage',
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        affiliateId: body.affiliateId || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('Create coupon error:', error)
    return NextResponse.json({ error: 'Erro ao criar cupom' }, { status: 500 })
  }
}
