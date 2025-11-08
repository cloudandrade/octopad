import { Tier } from '@/types/tier'

/**
 * Salva um tier como compartilhado no servidor
 */
export async function saveSharedTier(tier: Tier): Promise<boolean> {
  try {
    // Debug: verificar o que está sendo enviado
    console.log('Salvando tier compartilhado:', {
      name: tier.name,
      shareCode: tier.shareCode,
      padsCount: tier.pads?.length || 0,
      pads: tier.pads
    })
    
    const response = await fetch('/api/tiers/shared', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao salvar tier compartilhado:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao salvar tier compartilhado:', error)
    return false
  }
}

/**
 * Busca um tier compartilhado por código
 */
export async function getSharedTierByCode(shareCode: string): Promise<Tier | null> {
  try {
    const response = await fetch(`/api/tiers/shared?code=${encodeURIComponent(shareCode.toUpperCase())}`)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      const error = await response.json()
      console.error('Erro ao buscar tier compartilhado:', error)
      return null
    }

    const data = await response.json()
    return data.tier || null
  } catch (error) {
    console.error('Erro ao buscar tier compartilhado:', error)
    return null
  }
}

/**
 * Deleta um tier compartilhado do servidor
 */
export async function deleteSharedTier(shareCode: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/tiers/shared?code=${encodeURIComponent(shareCode.toUpperCase())}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao deletar tier compartilhado:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar tier compartilhado:', error)
    return false
  }
}

