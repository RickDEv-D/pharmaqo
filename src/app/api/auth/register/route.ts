import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, phone } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone: phone || null },
    })

    const token = generateToken({ userId: user.id, email: user.email, role: user.role })

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
