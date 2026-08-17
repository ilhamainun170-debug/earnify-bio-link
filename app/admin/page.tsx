import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { QuickActions } from '@/components/admin/quick-actions'
import { RecentLinks } from '@/components/admin/recent-links'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get total links
  const { count: totalLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })

  // Get active links
  const { count: activeLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // Get total clicks
  const { data: links } = await supabase
    .from('links')
    .select('clicks')

  const totalClicks = links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0

  // Get categories count
  const { count: totalCategories } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })

  // Get recent links
  const { data: recentLinks } = await supabase
    .from('links')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
    .limit(5)

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
