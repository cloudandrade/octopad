import { Tier } from '@/types/tier'
import { Pad } from '@/types/pad'

const STORAGE_KEY = 'octopad_tiers'
const PADS_PER_TIER = 8
const DEFAULT_TIERS_COUNT = 3

function generateShareCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}

export function getTiers(): Tier[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Inicializar com 3 tiers padrão
    const defaultTiers: Tier[] = []
    for (let i = 0; i < DEFAULT_TIERS_COUNT; i++) {
      defaultTiers.push({
        id: `tier-${i}`,
        name: '',
        shareCode: generateShareCode(),
        pads: [],
        position: i,
      })
    }
    saveTiers(defaultTiers)
    return defaultTiers
  }
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Carrega tiers do banco de dados e mescla com tiers do cache
 * Tiers do banco aparecem primeiro, depois os do cache
 */
export async function loadTiersFromDatabase(userId: string): Promise<Tier[]> {
  try {
    const { getUserTiers } = await import('./userTiersApi')
    const dbTiers = await getUserTiers(userId)
    
    // Buscar tiers do cache local
    const cacheTiers = getTiers()
    
    // Separar tiers do cache que não estão no banco
    const dbTierShareCodes = new Set(dbTiers.map(t => t.shareCode))
    const cacheOnlyTiers = cacheTiers.filter(t => !dbTierShareCodes.has(t.shareCode))
    
    // Ordenar tiers do cache que não estão no banco
    cacheOnlyTiers.sort((a, b) => a.position - b.position)
    
    // Combinar: tiers do banco primeiro, depois do cache
    const allTiers = [...dbTiers, ...cacheOnlyTiers]
    
    // Reordenar posições
    allTiers.forEach((tier, index) => {
      tier.position = index
    })
    
    // Salvar no localStorage
    saveTiers(allTiers)
    
    return allTiers
  } catch (error) {
    console.error('Erro ao carregar tiers do banco:', error)
    // Em caso de erro, retornar apenas tiers do cache
    return getTiers()
  }
}

export function saveTiers(tiers: Tier[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers))
}

export function updateTier(id: string, updates: Partial<Tier>, userId?: string): void {
  const tiers = getTiers()
  const index = tiers.findIndex((t) => t.id === id)
  if (index !== -1) {
    tiers[index] = { ...tiers[index], ...updates }
    saveTiers(tiers)
    
    const updatedTier = tiers[index]
    const hasName = updatedTier.name && updatedTier.name.trim().length > 0
    
    if (hasName && updatedTier.shareCode) {
      // Salvar como compartilhado (para compartilhamento)
      import('./tierStorageApi').then(({ saveSharedTier }) => {
        saveSharedTier(updatedTier).catch(console.error)
      })
      
      // Salvar no banco do usuário (se userId fornecido)
      if (userId) {
        import('./userTiersApi').then(({ saveUserTiers }) => {
          // Buscar todos os tiers com nome para salvar
          const namedTiers = tiers.filter(t => t.name && t.name.trim().length > 0)
          saveUserTiers(userId, namedTiers).catch(console.error)
        })
      }
    }
  }
}

export function addPadToTier(tierId: string, pad: Omit<Pad, 'id'>): Pad {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) throw new Error('Tier not found')
  
  const newPad: Pad = {
    ...pad,
    id: Date.now().toString(),
  }
  
  tier.pads.push(newPad)
  saveTiers(tiers)
  
  // Só salvar no banco se o tier tiver um nome (tiers sem nome ficam apenas no cache)
  const hasName = tier.name && tier.name.trim().length > 0
  if (hasName && tier.shareCode) {
    import('./tierStorageApi').then(({ saveSharedTier }) => {
      saveSharedTier(tier).catch(console.error)
    })
  }
  
  return newPad
}

export function updatePadInTier(tierId: string, padId: string, updates: Partial<Pad>): void {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return
  
  const padIndex = tier.pads.findIndex((p) => p.id === padId)
  if (padIndex !== -1) {
    tier.pads[padIndex] = { ...tier.pads[padIndex], ...updates }
    saveTiers(tiers)
    
    // Só salvar no banco se o tier tiver um nome (tiers sem nome ficam apenas no cache)
    const hasName = tier.name && tier.name.trim().length > 0
    if (hasName && tier.shareCode) {
      import('./tierStorageApi').then(({ saveSharedTier }) => {
        saveSharedTier(tier).catch(console.error)
      })
    }
  }
}

export function deletePadFromTier(tierId: string, padId: string): void {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return
  
  tier.pads = tier.pads.filter((p) => p.id !== padId)
  saveTiers(tiers)
  
  // Só salvar no banco se o tier tiver um nome (tiers sem nome ficam apenas no cache)
  const hasName = tier.name && tier.name.trim().length > 0
  if (hasName && tier.shareCode) {
    import('./tierStorageApi').then(({ saveSharedTier }) => {
      saveSharedTier(tier).catch(console.error)
    })
  }
}

export function getPadAtPosition(tierId: string, position: number): Pad | null {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return null
  
  return tier.pads.find((p) => p.position === position) || null
}

export function getTierPads(tierId: string): (Pad | null)[] {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return new Array(PADS_PER_TIER).fill(null)
  
  const grid: (Pad | null)[] = new Array(PADS_PER_TIER).fill(null)
  tier.pads.forEach((pad) => {
    if (pad.position >= 0 && pad.position < PADS_PER_TIER) {
      grid[pad.position] = pad
    }
  })
  
  return grid
}

export async function addTierByCode(shareCode: string): Promise<Tier | null> {
  // Primeiro, verificar se o tier existe localmente (para compatibilidade)
  const allTiers = getTiers()
  const localTier = allTiers.find((t) => t.shareCode === shareCode.toUpperCase())
  
  if (localTier) {
    // Criar uma cópia do tier local
    const newTierId = `tier-${Date.now()}`
    const newTier: Tier = {
      id: newTierId,
      name: localTier.name,
      shareCode: generateShareCode(), // Novo código para o tier copiado
      pads: localTier.pads.map((pad, index) => ({
        ...pad,
        id: `${pad.id}-${Date.now()}-${index}`, // Novo ID para os pads
        tierId: newTierId, // Novo tierId
      })),
      position: allTiers.length,
    }
    
    allTiers.push(newTier)
    saveTiers(allTiers)
    return newTier
  }
  
  // Buscar tier compartilhado no servidor
  const { getSharedTierByCode } = await import('./tierStorageApi')
  const sharedTier = await getSharedTierByCode(shareCode)
  
  if (sharedTier) {
    // Debug: verificar se os pads estão presentes
    console.log('Tier compartilhado encontrado:', {
      name: sharedTier.name,
      padsCount: sharedTier.pads?.length || 0,
      pads: sharedTier.pads
    })
    // Criar uma cópia do tier compartilhado
    const newTierId = `tier-${Date.now()}`
    const timestamp = Date.now()
    
    // Copiar pads com todos os campos necessários
    const copiedPads = (sharedTier.pads || []).map((pad: Pad, index: number) => ({
      id: `${pad.id}-${timestamp}-${index}`, // Novo ID para os pads
      name: pad.name || '',
      url: pad.url || '',
      iconUrl: pad.iconUrl || '',
      position: pad.position ?? index, // Preservar posição original ou usar índice
      tierId: newTierId, // Novo tierId
    }))
    
    const newTier: Tier = {
      id: newTierId,
      name: sharedTier.name || '',
      shareCode: generateShareCode(), // Novo código para o tier copiado
      pads: copiedPads,
      position: allTiers.length,
    }
    
    allTiers.push(newTier)
    saveTiers(allTiers)
    return newTier
  }
  
  return null
}

