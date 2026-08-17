import { createClient } from '@/lib/supabase/server'
import { LinksView } from '@/components/admin/links-view'

export const dynamic = 'force-dynamic'

export default async function LinksPage() {
  const supabase = await createClient()

  // Get all links with categories
  const { data: links } = await supabase
    .from('links')
    .select('*, categories(name)')
    .order('sort_order', { ascending: true })

  // Get all categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <LinksView
      initialLinks={links || []}
      categories={categories || []}
    />
  )
}
