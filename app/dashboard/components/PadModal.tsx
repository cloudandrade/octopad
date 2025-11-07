'use client'

import { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { Pad } from '@/types/pad'
import { addPadToTier, updatePadInTier, deletePadFromTier } from '@/lib/tierStorage'
import styles from './PadModal.module.css'

interface PadModalProps {
  show: boolean
  onHide: () => void
  tierId: string | null
  position: number | null
  pad: Pad | null
  onSave: () => void
}

export default function PadModal({
  show,
  onHide,
  tierId,
  position,
  pad,
  onSave,
}: PadModalProps) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')

  useEffect(() => {
    if (pad) {
      setName(pad.name || '')
      setUrl(pad.url)
      setIconUrl(pad.iconUrl)
    } else {
      setName('')
      setUrl('')
      setIconUrl('')
    }
  }, [pad, show])

  const handleSave = () => {
    if (position === null || !tierId) return

    if (!name.trim()) {
      alert('Por favor, preencha o nome do Pad')
      return
    }

    if (!url.trim()) {
      alert('Por favor, preencha a URL')
      return
    }

    // Garantir que a URL comece com http:// ou https://
    let formattedUrl = url.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    if (pad) {
      // Atualizar pad existente
      updatePadInTier(tierId, pad.id, {
        name: name.trim(),
        url: formattedUrl,
        iconUrl: iconUrl.trim(),
        position: pad.position,
        tierId,
      })
    } else {
      // Criar novo pad
      addPadToTier(tierId, {
        name: name.trim(),
        url: formattedUrl,
        iconUrl: iconUrl.trim(),
        position,
        tierId,
      })
    }

    onSave()
  }

  const handleDelete = () => {
    if (pad && tierId && confirm('Tem certeza que deseja excluir este Pad?')) {
      deletePadFromTier(tierId, pad.id)
      onSave()
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
        <Modal.Title>
          {pad ? 'Editar Pad' : 'Adicionar Pad'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nome do Pad</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex: Google, GitHub, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.formControl}
            />
            <Form.Text className="text-muted">
              Nome que aparecerá acima do pad
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://exemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={styles.formControl}
            />
            <Form.Text className="text-muted">
              Digite a URL completa do site
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>URL do Ícone (opcional)</Form.Label>
            <Form.Control
              type="text"
              placeholder="https://exemplo.com/icon.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className={styles.formControl}
            />
            <Form.Text className="text-muted">
              URL de uma imagem para usar como ícone
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        {pad && (
          <Button
            variant="danger"
            onClick={handleDelete}
            className={styles.deleteButton}
          >
            Excluir
          </Button>
        )}
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

