'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/analytics': 'Analytics',
  '/admin/links': 'Link Management',
  '/admin/categories': 'Categories',
  '/admin/customization': 'Customization',
}

export function AdminHeader() {
  const pathname = usePathname()
  const title = pageTitles[pathname] || 'Admin'

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 pl-12 lg:pl-0">
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>

        <Link href="/" target="_blank">
          <Button variant="outline" size="sm" className="gap-2 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
            View Site
            <ExternalLink className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
