'use client'

import { useState, useRef, useEffect } from 'react'
import { Pad } from '@/types/pad'
import styles from './PadCard.module.css'

interface PadCardProps {
  pad: Pad | null
  position: number
  onClick: (position: number, pad: Pad | null) => void
  onDelete?: (pad: Pad) => void
  onEdit?: (position: number, pad: Pad) => void
}

export default function PadCard({ pad, position, onClick, onDelete, onEdit }: PadCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showDeleteIcon, setShowDeleteIcon] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)
  const shakeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isHoldingRef = useRef(false)

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current)
      }
      if (shakeTimerRef.current) {
        clearTimeout(shakeTimerRef.current)
      }
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!pad || e.button !== 0) return // Apenas botão esquerdo
    
    isHoldingRef.current = true
    
    // Timer para começar a tremer após 1 segundo
    shakeTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        setIsShaking(true)
      }
    }, 1000) // 1 segundo
    
    // Timer para mostrar a lixeira após 3 segundos
    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        setShowDeleteIcon(true)
        setIsShaking(false) // Para de tremer quando a lixeira aparece
      }
    }, 3000) // 3 segundos
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!pad) return
    
    const timerWasActive = holdTimerRef.current !== null
    isHoldingRef.current = false
    
    // Limpar timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current)
      shakeTimerRef.current = null
    }
    
    // Parar tremor
    setIsShaking(false)
    
    // Se o timer ainda estava ativo (clique rápido), executa o clique normal
    // Se o timer já foi executado (mostrou a lixeira), não executa clique
    if (timerWasActive && !showDeleteIcon) {
      handleClick(e)
    }
  }

  const handleMouseLeave = () => {
    if (!pad) return
    
    isHoldingRef.current = false
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current)
      shakeTimerRef.current = null
    }
    setShowDeleteIcon(false)
    setIsShaking(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pad) return
    
    isHoldingRef.current = true
    
    // Timer para começar a tremer após 1 segundo
    shakeTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        setIsShaking(true)
      }
    }, 1000) // 1 segundo
    
    // Timer para mostrar a lixeira após 3 segundos
    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        setShowDeleteIcon(true)
        setIsShaking(false) // Para de tremer quando a lixeira aparece
      }
    }, 3000) // 3 segundos
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!pad) return
    
    const timerWasActive = holdTimerRef.current !== null
    isHoldingRef.current = false
    
    // Limpar timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
    if (shakeTimerRef.current) {
      clearTimeout(shakeTimerRef.current)
      shakeTimerRef.current = null
    }
    
    // Parar tremor
    setIsShaking(false)
    
    // Se o timer ainda estava ativo (toque rápido), executa o clique normal
    // Se o timer já foi executado (mostrou a lixeira), não executa clique
    if (timerWasActive && !showDeleteIcon) {
      const fakeEvent = {
        ctrlKey: false,
        metaKey: false,
      } as React.MouseEvent
      handleClick(fakeEvent)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (showDeleteIcon) return // Não executa clique se a lixeira está visível
    
    if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd + clique para editar
      e.preventDefault()
      onClick(position, pad)
    } else if (pad) {
      // Clique normal abre em nova aba
      window.open(pad.url, '_blank', 'noopener,noreferrer')
    } else {
      // Pad vazio abre modal para adicionar
      onClick(position, null)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick(position, pad)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pad && onDelete) {
      onDelete(pad)
      setShowDeleteIcon(false)
    }
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteIcon(false)
    setIsShaking(false)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (pad && onEdit) {
      onEdit(position, pad)
      setShowDeleteIcon(false)
      setIsShaking(false)
    }
  }

  const DefaultIcon = () => (
    <div className={styles.fallbackIcon}>
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </div>
  )

  return (
    <div className={styles.padWrapper}>
      {pad && pad.name && (
        <div className={styles.padName}>{pad.name}</div>
      )}
      <div
        className={`${styles.padCard} ${isShaking ? styles.shaking : ''}`}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
      {showDeleteIcon && pad && (
        <div className={styles.deleteOverlay}>
          <button
            className={styles.editButton}
            onClick={handleEditClick}
            title="Editar Pad"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            title="Apagar Pad"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
          <button
            className={styles.cancelButton}
            onClick={handleCancelDelete}
            title="Cancelar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}
      {pad ? (
        <div className={styles.padContent}>
          {pad.iconUrl && !imageError ? (
            <img
              src={pad.iconUrl}
              alt="Pad icon"
              className={styles.padIcon}
              onError={() => setImageError(true)}
            />
          ) : (
            <DefaultIcon />
          )}
        </div>
      ) : (
        <div className={styles.emptyPad}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      )}
      </div>
    </div>
  )
}

