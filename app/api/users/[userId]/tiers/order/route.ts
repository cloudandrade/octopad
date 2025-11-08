import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// POST: Atualizar ordem dos tiers
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const body = await request.json()
    const { tierIds } = body as { tierIds: string[] }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    if (!tierIds || !Array.isArray(tierIds)) {
      return NextResponse.json(
        { error: 'Lista de IDs dos tiers é obrigatória' },
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

    // Atualizar a posição de cada tier
    for (let i = 0; i < tierIds.length; i++) {
      const tierId = tierIds[i]
      await db`
        UPDATE user_tiers
        SET position = ${i}, updated_at = NOW()
        WHERE id = ${tierId} AND user_id = ${userId}
      `
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao atualizar ordem dos tiers:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar ordem dos tiers', details: error?.message },
      { status: 500 }
    )
  }
}

