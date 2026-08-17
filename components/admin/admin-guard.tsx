'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const activeSession = typeof window !== 'undefined' ? sessionStorage.getItem('admin_tab_session') : null

      if (!activeSession || activeSession !== 'active') {
        // Tab session missing (e.g. user closed tab, opened fresh tab, or cleared session)
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {
          // ignore
        }
        router.replace('/login')
      } else {
        setIsVerified(true)
      }
    }

    checkSession()
  }, [router])

  if (!isVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Verifying session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
