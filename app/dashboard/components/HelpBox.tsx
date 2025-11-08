'use client'

import { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'
import styles from './HelpBox.module.css'

interface HelpBoxProps {
  show: boolean
  onHide: () => void
}

export default function HelpBox({ show, onHide }: HelpBoxProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      contentClassName={styles.modalContent}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>📚 Guia de Ajuda - Octopad</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <div className={styles.helpContent}>
          <section className={styles.helpSection}>
            <h3 className={styles.sectionTitle}>🎯 Pads</h3>
            
            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Adicionar Pad</h4>
              <p className={styles.itemDescription}>
                Clique em qualquer espaço vazio dentro de um tier para adicionar um novo pad. 
                Preencha o nome, URL e opcionalmente uma imagem/ícone.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Editar Pad</h4>
              <p className={styles.itemDescription}>
                Clique em um pad existente para abrir o modal de edição. 
                Você pode alterar o nome, URL e ícone do pad.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Excluir Pad</h4>
              <p className={styles.itemDescription}>
                Clique e segure um pad por 3 segundos. Uma sobreposição aparecerá com opções de editar ou excluir. 
                Clique no ícone de lixeira para excluir o pad.
              </p>
            </div>
          </section>

          <section className={styles.helpSection}>
            <h3 className={styles.sectionTitle}>📋 Tiers</h3>
            
            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Adicionar Nome ao Tier</h4>
              <p className={styles.itemDescription}>
                Clique no botão "+ Adicionar nome" acima de um tier sem nome, 
                ou clique no nome do tier para editá-lo.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Mover Tier (Reorganizar)</h4>
              <p className={styles.itemDescription}>
                Clique e segure o nome de um tier por 2 segundos para ativar o modo de arraste. 
                Arraste o tier para a posição desejada e solte para confirmar. 
                A ordem será salva automaticamente.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Editar Tier</h4>
              <p className={styles.itemDescription}>
                Clique no nome do tier para abrir o modal de configuração. 
                Você pode alterar o nome e copiar o código de compartilhamento.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Excluir Tier</h4>
              <p className={styles.itemDescription}>
                Clique no nome do tier para abrir o modal. 
                No rodapé do modal, clique no ícone de lixeira (🗑️) e confirme a exclusão. 
                Todos os pads do tier serão perdidos.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Adicionar Tier por Código</h4>
              <p className={styles.itemDescription}>
                Clique no botão "+" no canto superior direito da navbar. 
                Selecione "Adicionar Tier por Código" e insira o código de compartilhamento. 
                O tier será copiado para sua conta.
              </p>
            </div>

            <div className={styles.helpItem}>
              <h4 className={styles.itemTitle}>Compartilhar Tier</h4>
              <p className={styles.itemDescription}>
                Abra o modal de configuração do tier e copie o código de compartilhamento. 
                Compartilhe este código com outros usuários para que eles possam adicionar o tier.
              </p>
            </div>
          </section>

          <section className={styles.helpSection}>
            <h3 className={styles.sectionTitle}>💡 Dicas</h3>
            
            <div className={styles.helpItem}>
              <ul className={styles.tipsList}>
                <li>Os tiers com nome são salvos automaticamente na nuvem</li>
                <li>Tiers sem nome ficam apenas no cache local do navegador</li>
                <li>Você pode reorganizar tiers arrastando-os pela tela</li>
                <li>Use o código de compartilhamento para sincronizar tiers entre dispositivos</li>
                <li>Os pads são organizados em uma grade de 8 colunas</li>
              </ul>
            </div>
          </section>
        </div>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button
          variant="primary"
          onClick={onHide}
          className={styles.closeButton}
        >
          Entendi!
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

