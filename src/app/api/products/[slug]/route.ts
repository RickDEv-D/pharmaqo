import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
    include: { images: true, category: true },
  })

  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, active: true },
    include: { images: true, category: true },
    take: 4,
  })

  return NextResponse.json({ product, related })
}

export async function PUT(request: Request, { params }: { params: { slug: string } }) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: params.slug }, { id: params.slug }] },
    })

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: body.name ?? product.name,
        description: body.description ?? product.description,
        price: body.price ? parseFloat(body.price) : product.price,
        comparePrice: body.comparePrice !== undefined ? (body.comparePrice ? parseFloat(body.comparePrice) : null) : product.comparePrice,
        stock: body.stock !== undefined ? parseInt(body.stock) : product.stock,
        categoryId: body.categoryId ?? product.categoryId,
        composition: body.composition ?? product.composition,
        benefits: body.benefits ?? product.benefits,
        dosage: body.dosage ?? product.dosage,
        tags: body.tags ?? product.tags,
        featured: body.featured ?? product.featured,
        active: body.active ?? product.active,
        lot: body.lot ?? product.lot,
        expiry: body.expiry ?? product.expiry,
      },
      include: { images: true, category: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { slug: string } }) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const product = await prisma.product.findFirst({
    where: { OR: [{ slug: params.slug }, { id: params.slug }] },
  })
  if (!product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  await prisma.product.update({ where: { id: product.id }, data: { active: false } })
  return NextResponse.json({ success: true })
}
