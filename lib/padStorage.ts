import { Pad } from '@/types/pad'

const STORAGE_KEY = 'octopad_pads'
const GRID_SIZE = 24 // 3 fileiras de 8
const PADS_PER_ROW = 8

export function getPads(): Pad[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function savePads(pads: Pad[]): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pads))
}

export function addPad(pad: Omit<Pad, 'id'>): Pad {
  const pads = getPads()
  const newPad: Pad = {
    ...pad,
    id: Date.now().toString(),
  }
  pads.push(newPad)
  savePads(pads)
  return newPad
}

export function updatePad(id: string, updates: Partial<Pad>): void {
  const pads = getPads()
  const index = pads.findIndex((p) => p.id === id)
  if (index !== -1) {
    pads[index] = { ...pads[index], ...updates }
    savePads(pads)
  }
}

export function deletePad(id: string): void {
  const pads = getPads()
  const filtered = pads.filter((p) => p.id !== id)
  savePads(filtered)
}

export function getPadAtPosition(position: number): Pad | null {
  const pads = getPads()
  return pads.find((p) => p.position === position) || null
}

export function getGridPads(): (Pad | null)[] {
  const pads = getPads()
  const grid: (Pad | null)[] = new Array(GRID_SIZE).fill(null)
  
  pads.forEach((pad) => {
    if (pad.position >= 0 && pad.position < GRID_SIZE) {
      grid[pad.position] = pad
    }
  })
  
  return grid
}

