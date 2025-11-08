'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal, Button, Form, InputGroup, Alert } from 'react-bootstrap'
import { Tier } from '@/types/tier'
import { updateTier, deleteTier } from '@/lib/tierStorage'
import styles from './TierModal.module.css'

interface TierModalProps {
  show: boolean
  onHide: () => void
  tier: Tier
  onSave: () => void
  onDelete?: () => void
}

export default function TierModal({
  show,
  onHide,
  tier,
  onSave,
  onDelete,
}: TierModalProps) {
  const [name, setName] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (tier) {
      setName(tier.name || '')
      setShareCode(tier.shareCode || '')
    }
    // Resetar confirmação quando o modal abrir/fechar
    setShowDeleteConfirm(false)
  }, [tier, show])

  const { data: session } = useSession()

  const handleSave = async () => {
    const trimmedName = name.trim()
    const userId = session?.user?.id
    
    // Atualizar tier (passa userId para salvar no banco se tiver nome)
    updateTier(tier.id, {
      name: trimmedName,
    }, userId)
    
    onSave()
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode)
    alert('Código copiado!')
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    const userId = session?.user?.id
    deleteTier(tier.id, userId)
    
    if (onDelete) {
      onDelete()
    } else {
      onSave() // Se não houver callback específico, usar onSave para recarregar
    }
    
    onHide()
  }

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false)
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName={styles.modalContent}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Configurar Tier</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        {showDeleteConfirm && (
          <Alert variant="danger" className={styles.deleteAlert}>
            <Alert.Heading>Tem certeza que deseja excluir este tier?</Alert.Heading>
            <p>
              Esta ação não pode ser desfeita. Todos os pads deste tier serão perdidos.
            </p>
          </Alert>
        )}
        {!showDeleteConfirm && (
          <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nome do Tier</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Ex: Trabalho, Pessoal, etc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formControl}
                />
                <Form.Text className="text-muted">
                  Dê um nome para este tier
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Código de Compartilhamento</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={shareCode}
                    readOnly
                    className={styles.formControl}
                  />
                  <Button
                    variant="secondary"
                    onClick={handleCopyCode}
                    className={styles.copyButton}
                  >
                    Copiar
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Compartilhe este código para que outros usuários possam adicionar este tier
                </Form.Text>
              </Form.Group>
            </Form>
        )}
      </Modal.Body>
      {!showDeleteConfirm ? (
        <Modal.Footer className={styles.modalFooter}>
          <Button
            variant="danger"
            onClick={handleDeleteClick}
            className={styles.deleteButton}
            title="Excluir tier"
          >
            🗑️
          </Button>
          <div className={styles.footerButtons}>
            <Button
              variant="secondary"
              onClick={onHide}
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className={styles.saveButton}
            >
              Salvar
            </Button>
          </div>
        </Modal.Footer>
      ) : (
        <Modal.Footer className={styles.modalFooter}>
          <div className={styles.footerButtons}>
            <Button
              variant="secondary"
              onClick={handleDeleteCancel}
              className={styles.cancelDeleteButton}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              className={styles.confirmDeleteButton}
            >
              Sim, excluir
            </Button>
          </div>
        </Modal.Footer>
      )}
    </Modal>
  )
}


