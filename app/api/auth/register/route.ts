import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body as {
      name: string
      email: string
      password: string
    }

    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    const db = getDb()

    if (!db) {
      return NextResponse.json(
        { error: 'Banco de dados não configurado' },
        { status: 500 }
      )
    }

    // Verificar se o email já existe
    const existingUser = await db`
      SELECT id FROM users WHERE email = ${email}
    `

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Gerar hash da senha
    const hashedPassword = await bcrypt.hash(password, 10)

    // Gerar ID único para o usuário
    const userId = uuidv4()

    // Criar usuário
    await db`
      INSERT INTO users (id, email, name, password, created_at, updated_at)
      VALUES (${userId}, ${email}, ${name}, ${hashedPassword}, NOW(), NOW())
    `

    return NextResponse.json({ 
      success: true,
      userId,
      message: 'Usuário criado com sucesso' 
    })
  } catch (error: any) {
    console.error('Erro ao registrar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar usuário', details: error?.message },
      { status: 500 }
    )
  }
}

