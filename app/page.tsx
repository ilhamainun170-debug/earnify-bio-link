import { getSiteSettings, getLinks, getCategories } from '@/lib/db'
import { PublicView } from '@/components/public/public-view'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [settings, allLinks, categoriesWithLinks] = await Promise.all([
    getSiteSettings(),
    getLinks(),
    getCategories(),
  ])

  // Standalone links without category
  const standaloneLinks = allLinks.filter((l) => !l.category_id && l.is_active)

  // Categories with their active links
  const activeCategories = categoriesWithLinks
    .map((cat) => ({
      ...cat,
      links: (cat.links || []).filter((l) => l.is_active),
    }))
    .filter((cat) => cat.links.length > 0)

  return (
    <PublicView
      settings={settings}
      standaloneLinks={standaloneLinks}
      categories={activeCategories}
    />
  )
}
