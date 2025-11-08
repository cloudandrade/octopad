'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Tier } from '@/types/tier'
import { Pad } from '@/types/pad'
import { getTiers, getTierPads, deletePadFromTier, loadTiersFromDatabase, saveTiers } from '@/lib/tierStorage'
import { updateTierOrder } from '@/lib/tierOrderApi'
import PadCard from './PadCard'
import PadModal from './PadModal'
import TierHeader from './TierHeader'
import DraggableTier from './DraggableTier'
import styles from './PadGrid.module.css'

export default function PadGrid() {
  const { data: session } = useSession()
  const [tiers, setTiers] = useState<Tier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPadModal, setShowPadModal] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [selectedPad, setSelectedPad] = useState<Pad | null>(null)
  
  // Estados para drag and drop
  const [draggingTier, setDraggingTier] = useState<Tier | null>(null)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [dropZoneIndex, setDropZoneIndex] = useState<number | null>(null)
  const tierSectionsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (session?.user?.id) {
      loadTiers()
    } else if (session === null) {
      // Se não há sessão, carregar apenas do cache
      const cacheTiers = getTiers()
      setTiers(cacheTiers)
      setIsLoading(false)
    }
  }, [session])

  const loadTiers = async () => {
    if (!session?.user?.id) {
      const cacheTiers = getTiers()
      setTiers(cacheTiers)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // Carregar tiers do banco e mesclar com cache
      const allTiers = await loadTiersFromDatabase(session.user.id)
      setTiers(allTiers)
    } catch (error) {
      console.error('Erro ao carregar tiers:', error)
      // Em caso de erro, usar apenas tiers do cache
      const cacheTiers = getTiers()
      setTiers(cacheTiers)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePadClick = (tierId: string, position: number, pad: Pad | null) => {
    setSelectedTierId(tierId)
    setSelectedPosition(position)
    setSelectedPad(pad)
    setShowPadModal(true)
  }

  const handlePadDelete = (tierId: string, pad: Pad) => {
    deletePadFromTier(tierId, pad.id)
    loadTiers()
  }

  const handlePadModalClose = () => {
    setShowPadModal(false)
    setSelectedTierId(null)
    setSelectedPosition(null)
    setSelectedPad(null)
  }

  const handlePadSaved = () => {
    loadTiers()
    handlePadModalClose()
  }

  useEffect(() => {
    const handleTierAdded = () => {
      loadTiers()
    }

    window.addEventListener('tierAdded', handleTierAdded)
    return () => {
      window.removeEventListener('tierAdded', handleTierAdded)
    }
  }, [])

  // Handlers para drag and drop
  const handleDragStart = (tier: Tier, event: React.MouseEvent) => {
    setDraggingTier(tier)
    setDragPosition({ x: event.clientX, y: event.clientY })
  }

  const handleDragEnd = useCallback(async () => {
    if (!draggingTier || dropZoneIndex === null) {
      setDraggingTier(null)
      setDropZoneIndex(null)
      return
    }

    setTiers((currentTiers) => {
      const draggedIndex = currentTiers.findIndex(t => t.id === draggingTier.id)
      
      if (draggedIndex === -1 || dropZoneIndex === draggedIndex) {
        return currentTiers
      }

      // Reorganizar tiers
      const newTiers = [...currentTiers]
      const [removed] = newTiers.splice(draggedIndex, 1)
      newTiers.splice(dropZoneIndex, 0, removed)
      
      // Atualizar posições
      newTiers.forEach((t, index) => {
        t.position = index
      })
      
      saveTiers(newTiers)
      
      // Salvar ordem no banco (apenas tiers com nome) - assíncrono
      if (session?.user?.id) {
        const namedTierIds = newTiers
          .filter(t => t.name && t.name.trim().length > 0)
          .map(t => t.id)
        
        if (namedTierIds.length > 0) {
          updateTierOrder(session.user.id, namedTierIds).catch(console.error)
        }
      }
      
      return newTiers
    })
    
    // Limpar estados após atualizar
    setDraggingTier(null)
    setDropZoneIndex(null)
  }, [draggingTier, dropZoneIndex, session])

  const handleDrag = useCallback((x: number, y: number) => {
    setDragPosition({ x, y })
    
    // Detectar qual tier está sendo sobreposto
    const elements = document.elementsFromPoint(x, y)
    const tierSection = elements.find(el => el.classList.contains(styles.tierSection))
    
    if (tierSection) {
      const tierIndex = tierSectionsRef.current.findIndex(ref => ref === tierSection)
      if (tierIndex !== -1 && draggingTier) {
        const draggedIndex = tiers.findIndex(t => t.id === draggingTier.id)
        if (tierIndex !== draggedIndex) {
          setDropZoneIndex(tierIndex)
        } else {
          setDropZoneIndex(null)
        }
      } else {
        setDropZoneIndex(null)
      }
    } else {
      setDropZoneIndex(null)
    }
  }, [draggingTier, tiers])

  // Adicionar listeners globais quando estiver arrastando
  useEffect(() => {
    if (!draggingTier) return

    const handleMouseMove = (e: MouseEvent) => {
      handleDrag(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      handleDragEnd()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggingTier, handleDrag, handleDragEnd])

  if (isLoading) {
    return (
      <div className={styles.padGridContainer}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#e0e0e0' }}>
          Carregando tiers...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={styles.padGridContainer}>
        {tiers.map((tier, index) => {
          const tierPads = getTierPads(tier.id)
          const isDropZone = dropZoneIndex === index && draggingTier && draggingTier.id !== tier.id
          const isDragging = draggingTier?.id === tier.id
          
          return (
            <div
              key={tier.id}
              ref={(el) => {
                tierSectionsRef.current[index] = el
              }}
              className={`${styles.tierSection} ${isDropZone ? styles.dropZone : ''} ${isDragging ? styles.dragging : ''}`}
            >
              <TierHeader 
                tier={tier} 
                onUpdate={loadTiers}
                onDragStart={handleDragStart}
              />
              
              <div className={styles.padRow}>
                {tierPads.map((pad, padIndex) => {
                  const position = padIndex
                  return (
                    <PadCard
                      key={pad ? pad.id : `empty-${tier.id}-${position}`}
                      pad={pad}
                      position={position}
                      onClick={(pos, p) => handlePadClick(tier.id, pos, p)}
                      onDelete={(p) => handlePadDelete(tier.id, p)}
                      onEdit={(pos, p) => handlePadClick(tier.id, pos, p)}
                    />
                  )
                })}
              </div>
              
              {tier.position < tiers.length - 1 && (
                <div className={styles.rowDivider} />
              )}
            </div>
          )
        })}
      </div>

      {draggingTier && (
        <DraggableTier
          tier={draggingTier}
          isDragging={true}
          position={dragPosition}
        />
      )}

      <PadModal
        show={showPadModal}
        onHide={handlePadModalClose}
        tierId={selectedTierId}
        position={selectedPosition}
        pad={selectedPad}
        onSave={handlePadSaved}
      />
    </>
  )
}

