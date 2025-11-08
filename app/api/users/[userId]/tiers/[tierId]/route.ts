import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

// DELETE: Deletar tier do usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string; tierId: string } }
) {
  try {
    const userId = params.userId
    const tierId = params.tierId

    if (!userId || !tierId) {
      return NextResponse.json(
        { error: 'ID do usuário e ID do tier são obrigatórios' },
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

    // Deletar tier do banco
    await db`
      DELETE FROM user_tiers
      WHERE id = ${tierId} AND user_id = ${userId}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao deletar tier do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar tier do usuário', details: error?.message },
      { status: 500 }
    )
  }
}

