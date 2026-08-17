import { createClient } from '@/lib/supabase/server'
import { CustomizationView } from '@/components/admin/customization-view'

export const dynamic = 'force-dynamic'

export default async function CustomizationPage() {
  const supabase = await createClient()

  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .single()

  return (
    <CustomizationView
      initialSettings={settings || {
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
    />
  )
}
