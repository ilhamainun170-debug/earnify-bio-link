'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(true)

  useEffect(() => {
    // Check if the current browser tab has the active admin session marker
    const activeSession = typeof window !== 'undefined' ? sessionStorage.getItem('admin_tab_session') : null

    if (!activeSession || activeSession !== 'active') {
      setIsAuthorized(false)
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
      router.replace('/login')
    }
  }, [router])

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
