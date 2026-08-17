import { getLinks, getCategories } from '@/lib/db'
import { LinksView } from '@/components/admin/links-view'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const [links, categories] = await Promise.all([
    getLinks(),
    getCategories(),
  ])

  return (
    <LinksView
      initialLinks={links || []}
      categories={categories || []}
    />
  )
}
