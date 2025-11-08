import { Tier } from '@/types/tier'

/**
 * Busca todos os tiers do usuário do banco de dados
 */
export async function getUserTiers(userId: string): Promise<Tier[]> {
  try {
    const response = await fetch(`/api/users/${userId}/tiers`)

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      const error = await response.json()
      console.error('Erro ao buscar tiers do usuário:', error)
      return []
    }

    const data = await response.json()
    return data.tiers || []
  } catch (error) {
    console.error('Erro ao buscar tiers do usuário:', error)
    return []
  }
}

/**
 * Salva os tiers do usuário no banco de dados
 */
export async function saveUserTiers(userId: string, tiers: Tier[]): Promise<boolean> {
  try {
    const response = await fetch(`/api/users/${userId}/tiers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tiers }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao salvar tiers do usuário:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao salvar tiers do usuário:', error)
    return false
  }
}

/**
 * Sincroniza dados do usuário e seus tiers
 */
export async function syncUser(
  userId: string,
  email?: string,
  name?: string,
  image?: string,
  tiers?: Tier[]
): Promise<boolean> {
  try {
    const response = await fetch('/api/users/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, email, name, image, tiers }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Erro ao sincronizar usuário:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error)
    return false
  }
}

