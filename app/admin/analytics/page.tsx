import { createClient } from '@/lib/supabase/server'
import { AnalyticsView } from '@/components/admin/analytics-view'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // Get total clicks
  const { data: links } = await supabase
    .from('links')
    .select('clicks')

  const totalClicks = links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0

  // Get total links count
  const { count: totalLinks } = await supabase
    .from('links')
    .select('*', { count: 'exact', head: true })

  // Get top 5 links
  const { data: topLinks } = await supabase
    .from('links')
    .select('*, categories(name)')
    .order('clicks', { ascending: false })
    .limit(5)

  // Get clicks per day for last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: clickLogs } = await supabase
    .from('click_logs')
    .select('created_at')
    .gte('created_at', sevenDaysAgo.toISOString())

  // Group clicks by day
  const clicksPerDay: Record<string, number> = {}
  
  // Initialize all 7 days with 0
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    clicksPerDay[dateStr] = 0
  }

  // Count clicks per day
  clickLogs?.forEach((log) => {
    const dateStr = new Date(log.created_at).toISOString().split('T')[0]
    if (clicksPerDay[dateStr] !== undefined) {
      clicksPerDay[dateStr]++
    }
  })

  const clicksPerDayArray = Object.entries(clicksPerDay).map(([date, clicks]) => ({
    date,
    clicks,
  }))

  return (
    <AnalyticsView
      totalClicks={totalClicks}
      totalLinks={totalLinks || 0}
      topLinks={topLinks?.map((link) => ({
        ...link,
        category_name: link.categories?.name,
      })) || []}
      clicksPerDay={clicksPerDayArray}
    />
  )
}
