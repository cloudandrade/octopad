import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { Tier } from '@/types/tier'

// Fallback: armazenamento em memória para desenvolvimento (sem banco)
let sharedTiersCache: Map<string, Tier> = new Map()

// GET: Buscar tier por código de compartilhamento
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shareCode = searchParams.get('code')

  if (!shareCode) {
    return NextResponse.json(
      { error: 'Código de compartilhamento é obrigatório' },
      { status: 400 }
    )
  }

  const db = getDb()

  // Se banco de dados estiver configurado, usar PostgreSQL
  if (db) {
    try {
      const result = await db`
        SELECT * FROM shared_tiers 
        WHERE share_code = ${shareCode.toUpperCase()}
        LIMIT 1
      `

      if (!result || result.length === 0) {
        return NextResponse.json(
          { error: 'Código inválido ou tier não encontrado' },
          { status: 404 }
        )
      }

      const data = result[0]

      // Parse dos pads (pode vir como string ou objeto)
      let pads = []
      if (data.pads) {
        if (typeof data.pads === 'string') {
          try {
            pads = JSON.parse(data.pads)
          } catch {
            pads = []
          }
        } else if (Array.isArray(data.pads)) {
          pads = data.pads
        }
      }

      // Converter dados do banco para formato Tier
      const tier: Tier = {
        id: data.id,
        name: data.name || '',
        shareCode: data.share_code,
        pads: Array.isArray(pads) ? pads : [],
        position: data.position || 0,
      }

      return NextResponse.json({ tier })
    } catch (error: any) {
      console.error('Erro ao buscar tier:', error)
      
      // Verificar se é erro de tabela não encontrada
      if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
        return NextResponse.json(
          { 
            error: 'Tabela shared_tiers não encontrada. Execute o SQL do arquivo supabase/schema.sql no Supabase SQL Editor.',
            code: 'TABLE_NOT_FOUND'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Erro ao buscar tier compartilhado', details: error?.message },
        { status: 500 }
      )
    }
  }

  // Modo de desenvolvimento: usar cache em memória
  const tier = sharedTiersCache.get(shareCode.toUpperCase())
  if (!tier) {
    return NextResponse.json(
      { error: 'Código inválido ou tier não encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json({ tier })
}

// POST: Salvar tier compartilhado
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tier } = body as { tier: Tier }

    if (!tier || !tier.shareCode) {
      return NextResponse.json(
        { error: 'Tier e código de compartilhamento são obrigatórios' },
        { status: 400 }
      )
    }

    const db = getDb()

    // Se banco de dados estiver configurado, usar PostgreSQL
    if (db) {
      try {
        // Usar share_code como ID único no banco (evita conflitos de ID local)
        const shareCodeUpper = tier.shareCode.toUpperCase()
        const tierId = `shared-${shareCodeUpper}` // ID único baseado no share_code
        
        // Verificar se já existe um tier com este código
        const existing = await db`
          SELECT id FROM shared_tiers 
          WHERE share_code = ${shareCodeUpper}
          LIMIT 1
        `

        const tierData = {
          id: tierId,
          name: tier.name || '',
          share_code: shareCodeUpper,
          pads: JSON.stringify(tier.pads || []),
          position: tier.position || 0,
          updated_at: new Date(),
        }

        if (existing && existing.length > 0) {
          // Atualizar tier existente usando share_code
          await db`
            UPDATE shared_tiers 
            SET 
              name = ${tierData.name},
              pads = ${tierData.pads}::jsonb,
              position = ${tierData.position},
              updated_at = ${tierData.updated_at}
            WHERE share_code = ${tierData.share_code}
          `
        } else {
          // Criar novo tier usando ID baseado no share_code
          await db`
            INSERT INTO shared_tiers (id, name, share_code, pads, position, updated_at)
            VALUES (
              ${tierData.id},
              ${tierData.name},
              ${tierData.share_code},
              ${tierData.pads}::jsonb,
              ${tierData.position},
              ${tierData.updated_at}
            )
            ON CONFLICT (share_code) DO UPDATE SET
              name = EXCLUDED.name,
              pads = EXCLUDED.pads,
              position = EXCLUDED.position,
              updated_at = EXCLUDED.updated_at
          `
        }

        return NextResponse.json({ success: true })
      } catch (error: any) {
        console.error('Erro ao salvar tier:', error)
        
        // Verificar se é erro de tabela não encontrada
        if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
          return NextResponse.json(
            { 
              error: 'Tabela shared_tiers não encontrada. Execute o SQL do arquivo supabase/schema.sql no Supabase SQL Editor.',
              code: 'TABLE_NOT_FOUND'
            },
            { status: 500 }
          )
        }
        
        return NextResponse.json(
          { error: 'Erro ao salvar tier compartilhado', details: error?.message },
          { status: 500 }
        )
      }
    }

    // Modo de desenvolvimento: usar cache em memória
    sharedTiersCache.set(tier.shareCode.toUpperCase(), tier)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro ao processar requisição' },
      { status: 500 }
    )
  }
}
