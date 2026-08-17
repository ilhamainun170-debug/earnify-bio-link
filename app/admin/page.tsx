import { getLinks, getCategories } from '@/lib/db'
import { DashboardStats } from '@/components/admin/dashboard-stats'
import { QuickActions } from '@/components/admin/quick-actions'
import { RecentLinks } from '@/components/admin/recent-links'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [links, categories] = await Promise.all([
    getLinks(),
    getCategories(),
  ])

  const totalLinks = links.length
  const activeLinks = links.filter((l) => l.is_active).length
  const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
  const totalCategories = categories.length
  const recentLinks = [...links].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5)

  return (
    <div className="space-y-8">
      <DashboardStats
        totalLinks={totalLinks}
        activeLinks={activeLinks}
        totalClicks={totalClicks}
        totalCategories={totalCategories}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentLinks links={recentLinks} />
      </div>
    </div>
  )
}
