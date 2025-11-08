import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { Tier } from '@/types/tier'

// POST: Sincronizar usuário e seus tiers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name, image, tiers } = body as {
      userId: string
      email?: string
      name?: string
      image?: string
      tiers?: Tier[]
    }

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

    // Criar ou atualizar usuário
    await db`
      INSERT INTO users (id, email, name, image, updated_at)
      VALUES (${userId}, ${email || ''}, ${name || ''}, ${image || ''}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        updated_at = NOW()
    `

    // Se tiers foram fornecidos, salvá-los
    if (tiers && Array.isArray(tiers)) {
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
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao sincronizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao sincronizar usuário', details: error?.message },
      { status: 500 }
    )
  }
}

