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

export function saveTiers(tiers: Tier[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers))
}

export function updateTier(id: string, updates: Partial<Tier>): void {
  const tiers = getTiers()
  const index = tiers.findIndex((t) => t.id === id)
  if (index !== -1) {
    tiers[index] = { ...tiers[index], ...updates }
    saveTiers(tiers)
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
  }
}

export function deletePadFromTier(tierId: string, padId: string): void {
  const tiers = getTiers()
  const tier = tiers.find((t) => t.id === tierId)
  if (!tier) return
  
  tier.pads = tier.pads.filter((p) => p.id !== padId)
  saveTiers(tiers)
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

export function addTierByCode(shareCode: string): Tier | null {
  // Buscar tier compartilhado
  // Por enquanto, busca nos tiers existentes do usuário
  // Em produção, isso viria de uma API que busca tiers compartilhados globalmente
  const allTiers = getTiers()
  const existingTier = allTiers.find((t) => t.shareCode === shareCode)
  
  if (existingTier) {
    // Criar uma cópia do tier (não compartilhar a mesma referência)
    const newTierId = `tier-${Date.now()}`
    const newTier: Tier = {
      id: newTierId,
      name: existingTier.name,
      shareCode: generateShareCode(), // Novo código para o tier copiado
      pads: existingTier.pads.map((pad, index) => ({
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
  
  // Em produção, aqui faria uma chamada à API para buscar tiers compartilhados
  // Por enquanto, retorna null se não encontrar
  return null
}

