'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import PadGrid from './components/PadGrid'
import LoadingScreen from '../components/LoadingScreen'
import styles from './page.module.css'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return <LoadingScreen theme="dark" />
  }

  if (!session) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <PadGrid />
      </div>
    </div>
  )
}
