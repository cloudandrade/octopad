'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import styles from './Navbar.module.css'
import AddTierModal from './AddTierModal'
import HelpBox from './HelpBox'

export default function Navbar() {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAddTierModal, setShowAddTierModal] = useState(false)
  const [showHelpBox, setShowHelpBox] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  if (!session) return null

  const handleAddTierClick = () => {
    setShowAddTierModal(true)
    setShowDropdown(false)
  }

  return (
    <>
      <nav className={`navbar ${styles.navbar}`}>
        <div className="container-fluid">
          <div className={styles.brand}>
            <span className={styles.logo}>🐙</span>
            <span className={styles.brandName}>Octopad</span>
          </div>
          
          <div className={styles.navActions}>
            <button
              className={styles.helpButton}
              onClick={() => setShowHelpBox(true)}
              aria-label="Ajuda"
              title="Ajuda"
            >
              <span className={styles.helpIcon}>❓</span>
            </button>

            <div className={styles.dropdownContainer} ref={dropdownRef}>
              <button
                className={styles.addButton}
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Add tier"
              >
                <span className={styles.addIcon}>+</span>
              </button>
              
              {showDropdown && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownItem}
                    onClick={handleAddTierClick}
                  >
                    Adicionar Tier por Código
                  </button>
                </div>
              )}
            </div>

            <div className={styles.userSection}>
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'Usuário'}
                  className={styles.avatar}
                />
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>
                  {session.user?.name || 'Usuário'}
                </span>
                <span className={styles.userEmail}>{session.user?.email}</span>
              </div>
              <button
                className={`btn ${styles.logoutButton}`}
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AddTierModal
        show={showAddTierModal}
        onHide={() => setShowAddTierModal(false)}
        onAdd={() => {
          setShowAddTierModal(false)
          // Trigger a reload in PadGrid if needed
          window.dispatchEvent(new Event('tierAdded'))
        }}
      />

      <HelpBox
        show={showHelpBox}
        onHide={() => setShowHelpBox(false)}
      />
    </>
  )
}

