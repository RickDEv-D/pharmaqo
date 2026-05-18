import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'templates') {
    const templates = await prisma.labelTemplate.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ templates })
  }

  const labels = await prisma.label.findMany({
    include: { product: { include: { images: true } }, template: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ labels })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (body.type === 'template') {
      const template = await prisma.labelTemplate.create({
        data: {
          name: body.name,
          width: body.width || 400,
          height: body.height || 300,
          background: body.background || null,
          fields: JSON.stringify(body.fields || []),
        },
      })
      return NextResponse.json(template, { status: 201 })
    }

    const label = await prisma.label.create({
      data: {
        productId: body.productId,
        templateId: body.templateId || null,
        data: JSON.stringify(body.data || {}),
      },
      include: { product: true, template: true },
    })

    return NextResponse.json(label, { status: 201 })
  } catch (error) {
    console.error('Create label error:', error)
    return NextResponse.json({ error: 'Erro ao criar etiqueta' }, { status: 500 })
  }
}
