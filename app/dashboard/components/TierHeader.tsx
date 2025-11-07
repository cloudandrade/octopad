'use client'

import { useState } from 'react'
import { Tier } from '@/types/tier'
import TierModal from './TierModal'
import styles from './TierHeader.module.css'

interface TierHeaderProps {
  tier: Tier
  onUpdate: () => void
}

export default function TierHeader({ tier, onUpdate }: TierHeaderProps) {
  const [showModal, setShowModal] = useState(false)

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
          <h3 className={styles.tierName} onClick={handleNameClick}>
            {tier.name}
          </h3>
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
      />
    </>
  )
}


