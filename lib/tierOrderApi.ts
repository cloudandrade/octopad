import { Tier } from '@/types/tier'

/**
 * Atualiza a ordem dos tiers no banco de dados
 */
export async function updateTierOrder(userId: string, tierIds: string[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}/tiers/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tierIds }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao atualizar ordem dos tiers:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao atualizar ordem dos tiers:', error)
    return false
  }
}

