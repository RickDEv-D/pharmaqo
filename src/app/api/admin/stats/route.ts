import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const [
    totalProducts,
    totalOrders,
    totalUsers,
    totalVerifications,
    pendingOrders,
    recentOrders,
    topProducts,
    recentVerifications,
  ] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'customer' } }),
    prisma.qRVerification.count(),
    prisma.order.count({ where: { status: 'pending' } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, items: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.qRVerification.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { product: { select: { name: true, uid: true } } },
    }),
  ])

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { status: { not: 'cancelled' } },
  })

  const suspiciousScans = await prisma.qRVerification.count({ where: { suspicious: true } })

  return NextResponse.json({
    stats: {
      totalProducts,
      totalOrders,
      totalUsers,
      totalVerifications,
      pendingOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      suspiciousScans,
    },
    recentOrders,
    topProducts,
    recentVerifications,
  })
}
