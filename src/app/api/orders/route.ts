import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const where = user.role === 'admin' ? {} : { userId: user.userId }
  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: { include: { images: true } } } },
      user: { select: { id: true, name: true, email: true, phone: true } },
      address: true,
      coupon: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { items, addressId, couponCode, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
    }

    let discount = 0
    let couponId = null

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
      if (coupon && coupon.active) {
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return NextResponse.json({ error: 'Cupom esgotado' }, { status: 400 })
        }
        couponId = coupon.id
      }
    }

    let subtotal = 0
    const orderItems: { productId: string; quantity: number; price: number; total: number }[] = []

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } })
      if (!product || !product.active) continue
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      })
    }

    if (couponId) {
      const coupon = await prisma.coupon.findUnique({ where: { id: couponId } })
      if (coupon) {
        discount = coupon.type === 'percentage' ? subtotal * (coupon.discount / 100) : coupon.discount
        await prisma.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
      }
    }

    let freight = 0
    if (addressId) {
      const address = await prisma.address.findUnique({ where: { id: addressId } })
      if (address) {
        const freightData = await prisma.freight.findUnique({ where: { state: address.state } })
        if (freightData) freight = freightData.price
      }
    }

    const total = subtotal - discount + freight

    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        addressId: addressId || null,
        subtotal,
        freight,
        discount,
        total,
        couponId,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { include: { images: true } } } },
        user: { select: { id: true, name: true, email: true } },
        address: true,
      },
    })

    // Create chat room for the order
    await prisma.chatRoom.create({
      data: {
        userId: user.userId,
        orderId: order.id,
        status: 'open',
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }
}
