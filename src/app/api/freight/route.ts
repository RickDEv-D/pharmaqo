import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { FREIGHT_TABLE } from '@/lib/utils'

export async function GET() {
  const freights = await prisma.freight.findMany({ orderBy: { state: 'asc' } })
  return NextResponse.json({ freights })
}

export async function POST(request: Request) {
  try {
    const { zipCode } = await request.json()
    if (!zipCode) {
      return NextResponse.json({ error: 'CEP é obrigatório' }, { status: 400 })
    }

    const cleanZip = zipCode.replace(/\D/g, '')
    let addressData = null

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`)
      addressData = await res.json()
    } catch {
      // ViaCEP unavailable, use manual lookup
    }

    let state = ''
    if (addressData && !addressData.erro) {
      state = addressData.uf
    }

    if (!state) {
      return NextResponse.json({ error: 'CEP não encontrado' }, { status: 404 })
    }

    const freightDb = await prisma.freight.findUnique({ where: { state } })
    const freightInfo = freightDb || FREIGHT_TABLE[state] || { price: 70, days: 10 }

    return NextResponse.json({
      address: addressData ? {
        street: addressData.logradouro,
        neighborhood: addressData.bairro,
        city: addressData.localidade,
        state: addressData.uf,
        zipCode: cleanZip,
      } : null,
      freight: {
        price: freightInfo.price,
        days: freightInfo.days,
        state,
      },
    })
  } catch (error) {
    console.error('Freight error:', error)
    return NextResponse.json({ error: 'Erro ao calcular frete' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { state, price, days } = body

    const freight = await prisma.freight.upsert({
      where: { state },
      update: { price, days },
      create: { state, price, days },
    })

    return NextResponse.json(freight)
  } catch (error) {
    console.error('Update freight error:', error)
    return NextResponse.json({ error: 'Erro ao atualizar frete' }, { status: 500 })
  }
}
