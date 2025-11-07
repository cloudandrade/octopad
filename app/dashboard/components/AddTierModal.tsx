'use client'

import { useState } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { addTierByCode } from '@/lib/tierStorage'
import styles from './TierModal.module.css'

interface AddTierModalProps {
  show: boolean
  onHide: () => void
  onAdd: () => void
}

export default function AddTierModal({
  show,
  onHide,
  onAdd,
}: AddTierModalProps) {
  const [code, setCode] = useState('')

  const handleAdd = () => {
    if (!code.trim()) {
      alert('Por favor, digite o código do tier')
      return
    }

    const tier = addTierByCode(code.trim().toUpperCase())
    if (tier) {
      setCode('')
      onAdd()
      onHide()
    } else {
      alert('Código inválido ou tier não encontrado')
    }
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName={styles.modalContent}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>Adicionar Tier por Código</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Código do Tier</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o código do tier"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={styles.formControl}
              maxLength={8}
            />
            <Form.Text className="text-muted">
              Digite o código de compartilhamento do tier
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
          onClick={handleAdd}
          className={styles.saveButton}
        >
          Adicionar
        </Button>
      </Modal.Footer>
    </Modal>
  )
}


