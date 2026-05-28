import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET() {
  const banners = await prisma.banner.findMany({
    where: { active: true },
    orderBy: { order: 'asc' },
  })
  return NextResponse.json({ banners })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle || null,
        image: body.image,
        link: body.link || null,
        active: body.active ?? true,
        order: body.order || 0,
      },
    })
    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Create banner error:', error)
    return NextResponse.json({ error: 'Erro ao criar banner' }, { status: 500 })
  }
}
