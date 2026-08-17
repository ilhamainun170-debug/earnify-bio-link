import { createClient } from '@/lib/supabase/server'
import { PublicView } from '@/components/public/public-view'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()

  // Get site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .single()

  // Get all active links without category
  const { data: standaloneLinks } = await supabase
    .from('links')
    .select('*')
    .eq('is_active', true)
    .is('category_id', null)
    .order('sort_order', { ascending: true })

  // Get all categories with their active links
  const { data: categories } = await supabase
    .from('categories')
    .select('*, links(*)')
    .order('sort_order', { ascending: true })

  // Filter to only active links in categories
  const categoriesWithActiveLinks = categories?.map((category) => ({
    ...category,
    links: category.links
      ?.filter((link: { is_active: boolean }) => link.is_active)
      ?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  })).filter((category) => category.links && category.links.length > 0)

  return (
    <PublicView
      settings={settings || {
        id: 'global',
        logo: null,
        name: 'LinkHub',
        description: 'Your personal link collection',
        twitter: null,
        instagram: null,
        youtube: null,
        medium: null,
        threads: null,
        pinterest: null,
        facebook: null,
      }}
      standaloneLinks={standaloneLinks || []}
      categories={categoriesWithActiveLinks || []}
    />
  )
}
