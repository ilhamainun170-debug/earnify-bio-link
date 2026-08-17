'use client'

import { motion } from 'framer-motion'
import { ExternalLink, MousePointerClick } from 'lucide-react'
import type { Link } from '@/lib/types'

interface RecentLinksProps {
  links: (Link & { categories?: { name: string } | null })[]
}

export function RecentLinks({ links }: RecentLinksProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Recent Links</h2>
      
      {links.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500">No links yet. Create your first link!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-white font-medium text-sm break-words [overflow-wrap:anywhere] line-clamp-2">{link.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {link.categories?.name && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 shrink-0">
                      {link.categories.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                    <MousePointerClick className="w-3 h-3" />
                    {link.clicks} clicks
                  </span>
                </div>
              </div>
              
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
