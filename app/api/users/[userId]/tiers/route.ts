import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDb } from '@/lib/db'
import { Tier } from '@/types/tier'

// GET: Buscar todos os tiers do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId

  if (!userId) {
    return NextResponse.json(
      { error: 'ID do usuário é obrigatório' },
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

  try {
    // Buscar ou criar usuário
    const user = await db`
      SELECT * FROM users WHERE id = ${userId} LIMIT 1
    `

    if (!user || user.length === 0) {
      return NextResponse.json({ tiers: [] })
    }

    // Buscar tiers do usuário ordenados por posição
    const tiers = await db`
      SELECT * FROM user_tiers 
      WHERE user_id = ${userId}
      ORDER BY position ASC
    `

    // Converter para formato Tier
    const formattedTiers: Tier[] = tiers.map((tier: any) => {
      // Parse dos pads (pode vir como string ou objeto)
      let pads = []
      if (tier.pads) {
        if (typeof tier.pads === 'string') {
          try {
            pads = JSON.parse(tier.pads)
          } catch {
            pads = []
          }
        } else if (Array.isArray(tier.pads)) {
          pads = tier.pads
        }
      }

      return {
        id: tier.id,
        name: tier.name || '',
        shareCode: tier.share_code,
        pads: Array.isArray(pads) ? pads : [],
        position: tier.position || 0,
      }
    })

    return NextResponse.json({ tiers: formattedTiers })
  } catch (error: any) {
    console.error('Erro ao buscar tiers do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tiers do usuário', details: error?.message },
      { status: 500 }
    )
  }
}

// POST: Salvar tiers do usuário
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const body = await request.json()
    const { tiers } = body as { tiers: Tier[] }

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    if (!tiers || !Array.isArray(tiers)) {
      return NextResponse.json(
        { error: 'Lista de tiers é obrigatória' },
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

    // Buscar ou criar usuário (será criado quando salvar tiers)
    // Por enquanto, apenas verificamos se existe

    // Salvar cada tier
    for (const tier of tiers) {
      if (!tier.shareCode) continue

      const tierData = {
        id: tier.id,
        user_id: userId,
        name: tier.name || '',
        share_code: tier.shareCode.toUpperCase(),
        pads: JSON.stringify(tier.pads || []),
        position: tier.position || 0,
        updated_at: new Date(),
      }

      // Usar UPSERT (INSERT ... ON CONFLICT)
      await db`
        INSERT INTO user_tiers (id, user_id, name, share_code, pads, position, updated_at)
        VALUES (
          ${tierData.id},
          ${tierData.user_id},
          ${tierData.name},
          ${tierData.share_code},
          ${tierData.pads}::jsonb,
          ${tierData.position},
          ${tierData.updated_at}
        )
        ON CONFLICT (user_id, share_code) DO UPDATE SET
          name = EXCLUDED.name,
          pads = EXCLUDED.pads,
          position = EXCLUDED.position,
          updated_at = EXCLUDED.updated_at
      `
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao salvar tiers do usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar tiers do usuário', details: error?.message },
      { status: 500 }
    )
  }
}

