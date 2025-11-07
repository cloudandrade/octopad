'use client'

import { useSession, signOut } from 'next-auth/react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <nav className={`navbar ${styles.navbar}`}>
      <div className="container-fluid">
        <div className={styles.brand}>
          <span className={styles.logo}>🐙</span>
          <span className={styles.brandName}>Octopad</span>
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
    </nav>
  )
}

