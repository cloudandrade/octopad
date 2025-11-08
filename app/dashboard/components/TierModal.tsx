'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal, Button, Form, InputGroup } from 'react-bootstrap'
import { Tier } from '@/types/tier'
import { updateTier } from '@/lib/tierStorage'
import styles from './TierModal.module.css'

interface TierModalProps {
  show: boolean
  onHide: () => void
  tier: Tier
  onSave: () => void
}

export default function TierModal({
  show,
  onHide,
  tier,
  onSave,
}: TierModalProps) {
  const [name, setName] = useState('')
  const [shareCode, setShareCode] = useState('')

  useEffect(() => {
    if (tier) {
      setName(tier.name || '')
      setShareCode(tier.shareCode || '')
    }
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
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
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
      </Modal.Footer>
    </Modal>
  )
}


