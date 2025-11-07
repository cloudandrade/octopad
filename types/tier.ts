import { Pad } from './pad'

export interface Tier {
  id: string
  name: string
  shareCode: string
  pads: Pad[]
  position: number // Posição do tier (0, 1, 2, etc.)
}


