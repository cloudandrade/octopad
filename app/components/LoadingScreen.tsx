'use client'

import styles from './LoadingScreen.module.css'

interface LoadingScreenProps {
  theme?: 'light' | 'dark'
}

export default function LoadingScreen({ theme = 'light' }: LoadingScreenProps) {
  return (
    <div className={`${styles.container} ${theme === 'dark' ? styles.darkTheme : ''}`}>
      <div className={styles.loadingWrapper}>
        <img 
          src="https://i.pinimg.com/originals/bb/2b/e4/bb2be42897f57cf55d49af855cb89d2a.gif" 
          alt="Loading..." 
          className={styles.loadingGif}
        />
        <p className={styles.loadingText}>Loading...</p>
      </div>
    </div>
  )
}

