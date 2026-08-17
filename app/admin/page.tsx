import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { QuickActions } from '@/components/admin/quick-actions'
import { RecentLinks } from '@/components/admin/recent-links'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Run all database queries in parallel for high performance
  const [
    { count: totalLinks },
    { count: activeLinks },
    { data: links },
    { count: totalCategories },
    { data: recentLinks },
  ] = await Promise.all([
    supabase.from('links').select('*', { count: 'exact', head: true }),
    supabase.from('links').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('links').select('clicks'),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('links').select('*, categories(name)').order('created_at', { ascending: false }).limit(5),
  ])

  const totalClicks = links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0

  return (
    <div className="space-y-8">
      <DashboardStats
        totalLinks={totalLinks || 0}
        activeLinks={activeLinks || 0}
        totalClicks={totalClicks}
        totalCategories={totalCategories || 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentLinks links={recentLinks || []} />
      </div>
    </div>
  )
}
