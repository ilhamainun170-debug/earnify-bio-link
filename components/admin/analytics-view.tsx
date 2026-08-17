'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MousePointerClick, Link2, TrendingUp, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { AnalyticsData } from '@/lib/types'

interface AnalyticsViewProps extends AnalyticsData {}

export function AnalyticsView({ totalClicks, totalLinks, topLinks, clicksPerDay }: AnalyticsViewProps) {
  const router = useRouter()
  const [isResetting, setIsResetting] = useState(false)

  const handleResetAnalytics = async () => {
    setIsResetting(true)
    try {
      const res = await fetch('/api/analytics/reset', { method: 'POST' })
      if (res.ok) {
        toast.success('Analytics reset successfully')
        router.refresh()
      } else {
        toast.error('Failed to reset analytics')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsResetting(false)
    }
  }

  // Format dates for chart
  const chartData = clicksPerDay.map((item) => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500 to-pink-600 opacity-10 blur-2xl -mr-8 -mt-8" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
              <MousePointerClick className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalClicks.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Total Clicks</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500 to-indigo-600 opacity-10 blur-2xl -mr-8 -mt-8" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4">
              <Link2 className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{totalLinks.toLocaleString()}</p>
            <p className="text-sm text-slate-400">Total Links</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative overflow-hidden bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 opacity-10 blur-2xl -mr-8 -mt-8" />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {totalLinks > 0 ? Math.round(totalClicks / totalLinks) : 0}
            </p>
            <p className="text-sm text-slate-400">Avg. Clicks per Link</p>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Clicks Over Time</h2>
          <span className="text-sm text-slate-400">Last 7 days</span>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="dateLabel" 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                itemStyle={{ color: '#818cf8' }}
              />
              <Line
                type="monotone"
                dataKey="clicks"
                stroke="#818cf8"
                strokeWidth={2}
                dot={{ fill: '#818cf8', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#818cf8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Links & Reset */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Top Performing Links</h2>
          
          {topLinks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500">No click data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">{link.title}</p>
                    {link.category_name && (
                      <span className="text-xs text-slate-500">{link.category_name}</span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{link.clicks}</p>
                    <p className="text-xs text-slate-500">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reset Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-lg border border-white/5 rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Reset Analytics</h2>
          
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <p className="text-slate-400 text-sm">
              This will reset all click counts to 0 and delete all click log history. 
              Your links and categories will not be affected.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={isResetting}
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Analytics
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This action cannot be undone. All click counts will be reset to 0 and all click logs will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetAnalytics}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Reset Analytics
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  )
}
