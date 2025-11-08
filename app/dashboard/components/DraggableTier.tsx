'use client'

import { Tier } from '@/types/tier'
import styles from './DraggableTier.module.css'

interface DraggableTierProps {
  tier: Tier
  isDragging: boolean
  position: { x: number; y: number }
}

export default function DraggableTier({
  tier,
  isDragging,
  position,
}: DraggableTierProps) {
  if (!isDragging) {
    return null
  }

  return (
    <div
      className={styles.draggableTier}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className={styles.draggableContent}>
        <div className={styles.dragIcon}>⋮⋮</div>
        <div className={styles.tierName}>{tier.name || 'Tier sem nome'}</div>
      </div>
    </div>
  )
}

