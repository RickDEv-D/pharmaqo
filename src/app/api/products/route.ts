import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { slugify, generateUID } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const featured = searchParams.get('featured')
  const tag = searchParams.get('tag')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: Record<string, unknown> = { active: true }
  if (category) where.category = { slug: category }
  if (search) where.name = { contains: search }
  if (featured === 'true') where.featured = true
  if (tag) where.tags = { contains: tag }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: true, category: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const slug = slugify(body.name)
    const uid = generateUID()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug,
        description: body.description || '',
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        stock: parseInt(body.stock) || 0,
        categoryId: body.categoryId,
        composition: body.composition || null,
        benefits: body.benefits || null,
        dosage: body.dosage || null,
        tags: body.tags || '',
        featured: body.featured || false,
        uid,
        lot: body.lot || null,
        expiry: body.expiry || null,
      },
      include: { images: true, category: true },
    })

    if (body.images && Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: body.images[i],
            isPrimary: i === 0,
            order: i,
          },
        })
      }
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { images: true, category: true },
    })

    return NextResponse.json(fullProduct, { status: 201 })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 })
  }
}
