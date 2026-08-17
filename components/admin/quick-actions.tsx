'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, BarChart3, Palette, ExternalLink } from 'lucide-react'

const actions = [
  { href: '/admin/links?new=link', icon: Plus, label: 'New Link', description: 'Add a new link to your page' },
  { href: '/admin/analytics', icon: BarChart3, label: 'View Analytics', description: 'See your click statistics' },
  { href: '/admin/customization', icon: Palette, label: 'Customize', description: 'Update your branding' },
  { href: '/', icon: ExternalLink, label: 'View Site', description: 'Preview your public page', external: true },
]

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            target={action.external ? '_blank' : undefined}
            className="group flex items-start gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/30 transition-colors">
              <action.icon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{action.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  )
}
