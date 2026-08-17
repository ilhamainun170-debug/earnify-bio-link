import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Link, Category, SiteSettings } from '@/lib/types'

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''

  return createSupabaseClient(url, key, {
    auth: { persistSession: false },
  })
}

// Fallback settings if db is empty
const defaultSettings: SiteSettings = {
  id: 'global',
  logo: null,
  name: 'Earnify',
  description: 'Koleksi produk rekomendasi & link affiliate terbaik',
  twitter: null,
  instagram: null,
  youtube: null,
  medium: null,
  threads: null,
  pinterest: null,
  facebook: null,
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.error('[DB] getSiteSettings error:', err)
  }
  return defaultSettings
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  try {
    const supabase = getClient()
    const payload = { ...defaultSettings, ...settings, id: 'global' }
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(payload)
      .select()
      .single()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.error('[DB] updateSiteSettings error:', err)
  }
  return { ...defaultSettings, ...settings }
}

export async function getCategories(): Promise<(Category & { links: Link[] })[]> {
  try {
    const supabase = getClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, links(*)')
      .order('sort_order', { ascending: true })

    if (!error && data) {
      return data.map((cat: Category & { links?: Link[] }) => ({
        ...cat,
        links: (cat.links || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
      }))
    }
  } catch (err) {
    console.error('[DB] getCategories error:', err)
  }
  return []
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = getClient()
  
  const { data: maxOrderData } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrderData?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), sort_order: newOrder })
    .select()
    .single()

  if (error) {
    console.error('[DB] createCategory error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[DB] updateCategory error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteCategory(id: string): Promise<boolean> {
  const supabase = getClient()
  await supabase.from('links').update({ category_id: null }).eq('category_id', id)
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) {
    console.error('[DB] deleteCategory error:', error)
    throw new Error(error.message)
  }
  return true
}

export async function getLinks(categoryId?: string | null): Promise<Link[]> {
  try {
    const supabase = getClient()
    let query = supabase.from('links').select('*, categories(name)').order('sort_order', { ascending: true })
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (!error && data) {
      return data
    }
  } catch (err) {
    console.error('[DB] getLinks error:', err)
  }
  return []
}

export async function createLink(linkData: {
  title: string
  url: string
  categoryId?: string | null
  imageUrl?: string | null
}): Promise<Link> {
  const supabase = getClient()

  // Get max sort order
  const { data: maxOrderData } = await supabase
    .from('links')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrderData?.sort_order || 0) + 1

  // Sanitize category_id so empty string or "none" becomes null
  const validCategoryId =
    linkData.categoryId &&
    linkData.categoryId !== 'none' &&
    linkData.categoryId.trim() !== ''
      ? linkData.categoryId
      : null

  const insertPayload: Record<string, unknown> = {
    title: linkData.title.trim(),
    url: linkData.url.trim(),
    category_id: validCategoryId,
    is_active: true,
    sort_order: newOrder,
    clicks: 0,
  }

  if (linkData.imageUrl) {
    insertPayload.image_url = linkData.imageUrl.trim()
  }

  let { data, error } = await supabase
    .from('links')
    .insert(insertPayload)
    .select('*, categories(name)')
    .single()

  // Auto fallback if image_url column doesn't exist in Supabase table yet
  if (error && (error.message?.includes('image_url') || error.code === '42703')) {
    delete insertPayload.image_url
    const retry = await supabase
      .from('links')
      .insert(insertPayload)
      .select('*, categories(name)')
      .single()

    if (!retry.error && retry.data) {
      return retry.data
    }
    error = retry.error
  }

  if (error) {
    console.error('[DB] createLink error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function updateLink(
  id: string,
  linkData: Partial<{
    title: string
    url: string
    categoryId: string | null
    imageUrl: string | null
    isActive: boolean
    sortOrder: number
  }>
): Promise<Link | null> {
  const supabase = getClient()
  const updatePayload: Record<string, unknown> = {}
  
  if (linkData.title !== undefined) updatePayload.title = linkData.title.trim()
  if (linkData.url !== undefined) updatePayload.url = linkData.url.trim()
  if (linkData.categoryId !== undefined) {
    updatePayload.category_id =
      linkData.categoryId && linkData.categoryId !== 'none' && linkData.categoryId.trim() !== ''
        ? linkData.categoryId
        : null
  }
  if (linkData.imageUrl !== undefined) updatePayload.image_url = linkData.imageUrl ? linkData.imageUrl.trim() : null
  if (linkData.isActive !== undefined) updatePayload.is_active = linkData.isActive
  if (linkData.sortOrder !== undefined) updatePayload.sort_order = linkData.sortOrder

  let { data, error } = await supabase
    .from('links')
    .update(updatePayload)
    .eq('id', id)
    .select('*, categories(name)')
    .single()

  if (error && (error.message?.includes('image_url') || error.code === '42703')) {
    delete updatePayload.image_url
    const retry = await supabase
      .from('links')
      .update(updatePayload)
      .eq('id', id)
      .select('*, categories(name)')
      .single()

    if (!retry.error && retry.data) {
      return retry.data
    }
    error = retry.error
  }

  if (error) {
    console.error('[DB] updateLink error:', error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteLink(id: string): Promise<boolean> {
  const supabase = getClient()
  const { error } = await supabase.from('links').delete().eq('id', id)
  if (error) {
    console.error('[DB] deleteLink error:', error)
    throw new Error(error.message)
  }
  return true
}

export async function trackClick(linkId: string): Promise<void> {
  const supabase = getClient()
  try {
    await Promise.all([
      supabase.rpc('increment_link_clicks', { link_id: linkId }),
      supabase.from('click_logs').insert({ link_id: linkId }),
    ])
  } catch {
    try {
      const { data: link } = await supabase.from('links').select('clicks').eq('id', linkId).single()
      if (link) {
        await supabase.from('links').update({ clicks: (link.clicks || 0) + 1 }).eq('id', linkId)
      }
    } catch {
      // ignore
    }
  }
}
