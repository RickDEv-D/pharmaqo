import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
    if (!coupon || !coupon.active) {
      return NextResponse.json({ valid: false, error: 'Cupom inválido' })
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: 'Cupom esgotado' })
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Cupom expirado' })
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      type: coupon.type,
      code: coupon.code,
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    return NextResponse.json({ error: 'Erro ao validar cupom' }, { status: 500 })
  }
}
