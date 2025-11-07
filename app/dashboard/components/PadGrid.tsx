'use client'

import { useState, useEffect } from 'react'
import { Tier } from '@/types/tier'
import { Pad } from '@/types/pad'
import { getTiers, getTierPads, deletePadFromTier } from '@/lib/tierStorage'
import PadCard from './PadCard'
import PadModal from './PadModal'
import TierHeader from './TierHeader'
import AddTierModal from './AddTierModal'
import styles from './PadGrid.module.css'

export default function PadGrid() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [showPadModal, setShowPadModal] = useState(false)
  const [showAddTierModal, setShowAddTierModal] = useState(false)
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null)
  const [selectedPad, setSelectedPad] = useState<Pad | null>(null)

  useEffect(() => {
    loadTiers()
  }, [])

  const loadTiers = () => {
    const allTiers = getTiers()
    setTiers(allTiers)
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

  const handleAddTierClick = () => {
    setShowAddTierModal(true)
  }

  const handleAddTierClose = () => {
    setShowAddTierModal(false)
  }

  const handleTierAdded = () => {
    loadTiers()
  }

  return (
    <>
      <div className={styles.padGridContainer}>
        <div className={styles.addTierButtonContainer}>
          <button className={styles.addTierButton} onClick={handleAddTierClick}>
            + Adicionar Tier por Código
          </button>
        </div>

        {tiers.map((tier) => {
          const tierPads = getTierPads(tier.id)
          
          return (
            <div key={tier.id} className={styles.tierSection}>
              <TierHeader tier={tier} onUpdate={loadTiers} />
              
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

      <PadModal
        show={showPadModal}
        onHide={handlePadModalClose}
        tierId={selectedTierId}
        position={selectedPosition}
        pad={selectedPad}
        onSave={handlePadSaved}
      />

      <AddTierModal
        show={showAddTierModal}
        onHide={handleAddTierClose}
        onAdd={handleTierAdded}
      />
    </>
  )
}

