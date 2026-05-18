import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    if (!code) {
      return NextResponse.json({ error: 'Código é obrigatório' }, { status: 400 })
    }

    const product = await prisma.product.findFirst({
      where: { OR: [{ uid: code }, { id: code }] },
      include: { images: true, category: true },
    })

    if (!product) {
      return NextResponse.json({
        valid: false,
        message: 'Produto não encontrado. Código inválido ou falsificado.',
      })
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    const previousScans = await prisma.qRVerification.count({
      where: { productId: product.id },
    })

    const suspicious = previousScans >= 3

    await prisma.qRVerification.create({
      data: {
        productId: product.id,
        ip,
        userAgent,
        scanCount: previousScans + 1,
        suspicious,
      },
    })

    if (suspicious) {
      return NextResponse.json({
        valid: true,
        suspicious: true,
        message: 'ATENÇÃO: Este código já foi utilizado anteriormente. Entre em contato com o suporte.',
        scanCount: previousScans + 1,
        product: {
          name: product.name,
          lot: product.lot,
          expiry: product.expiry,
          uid: product.uid,
          category: product.category.name,
        },
      })
    }

    return NextResponse.json({
      valid: true,
      suspicious: false,
      message: 'Produto autêntico verificado com sucesso!',
      scanCount: previousScans + 1,
      product: {
        name: product.name,
        description: product.description,
        lot: product.lot,
        expiry: product.expiry,
        uid: product.uid,
        category: product.category.name,
        composition: product.composition,
        image: product.images[0]?.url,
        createdAt: product.createdAt,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Erro ao verificar produto' }, { status: 500 })
  }
}
