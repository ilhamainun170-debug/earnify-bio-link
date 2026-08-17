'use client'

import { motion } from 'framer-motion'
import { Link2, MousePointerClick, Folder, CheckCircle } from 'lucide-react'

interface DashboardStatsProps {
  totalLinks: number
  activeLinks: number
  totalClicks: number
  totalCategories: number
}

const stats = [
  { key: 'totalLinks', icon: Link2, label: 'Total Links', color: 'from-indigo-500 to-indigo-600' },
  { key: 'activeLinks', icon: CheckCircle, label: 'Active Links', color: 'from-emerald-500 to-emerald-600' },
  { key: 'totalClicks', icon: MousePointerClick, label: 'Total Clicks', color: 'from-pink-500 to-pink-600' },
  { key: 'totalCategories', icon: Folder, label: 'Categories', color: 'from-amber-500 to-amber-600' },
]

export function DashboardStats({ totalLinks, activeLinks, totalClicks, totalCategories }: DashboardStatsProps) {
  const values: Record<string, number> = {
    totalLinks,
    activeLinks,
    totalClicks,
    totalCategories,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl -mr-8 -mt-8`} />
          
          <div className="relative">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            
            <p className="text-3xl font-bold text-white mb-1">
              {values[stat.key].toLocaleString()}
            </p>
            <p className="text-sm text-slate-400">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
