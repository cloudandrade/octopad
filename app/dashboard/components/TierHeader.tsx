'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Tier } from '@/types/tier'
import TierModal from './TierModal'
import styles from './TierHeader.module.css'

interface TierHeaderProps {
  tier: Tier
  onUpdate: () => void
  onDragStart?: (tier: Tier, event: React.MouseEvent) => void
}

export default function TierHeader({ tier, onUpdate, onDragStart }: TierHeaderProps) {
  const [showModal, setShowModal] = useState(false)
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const pressStartTime = useRef<number>(0)
  const pressStartPosition = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tier.name || e.button !== 0) return // Apenas botão esquerdo e se tiver nome
    
    pressStartTime.current = Date.now()
    pressStartPosition.current = { x: e.clientX, y: e.clientY }
    
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true)
      if (onDragStart) {
        onDragStart(tier, e)
      }
    }, 2000) // 2 segundos
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    
    // Se não foi long press, abrir modal
    if (pressStartTime.current && Date.now() - pressStartTime.current < 2000) {
      if (pressStartPosition.current) {
        const moved = Math.abs(pressStartPosition.current.x - e.clientX) > 5 ||
                      Math.abs(pressStartPosition.current.y - e.clientY) > 5
        
        if (!moved && !isLongPress) {
          handleNameClick()
        }
      }
    }
    
    setIsLongPress(false)
    pressStartTime.current = 0
    pressStartPosition.current = null
  }

  const handleMouseLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsLongPress(false)
  }

  const handleNameClick = () => {
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  const handleTierUpdated = () => {
    onUpdate()
    handleModalClose()
  }

  return (
    <>
      <div className={styles.tierHeader}>
        {tier.name ? (
          <div
            className={`${styles.tierNameContainer} ${isLongPress ? styles.dragging : ''}`}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
            <span className={styles.dragIcon}>⋮⋮</span>
            <h3 className={styles.tierName}>
              {tier.name}
            </h3>
          </div>
        ) : (
          <button className={styles.addNameButton} onClick={handleNameClick}>
            + Adicionar nome
          </button>
        )}
      </div>

      <TierModal
        show={showModal}
        onHide={handleModalClose}
        tier={tier}
        onSave={handleTierUpdated}
        onDelete={handleTierUpdated}
      />
    </>
  )
}


