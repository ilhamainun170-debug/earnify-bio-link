import { createClient } from '@/lib/supabase/server'
import type { Link, Category, SiteSettings } from '@/lib/types'

// Resilient memory store fallback
interface MemoryStore {
  settings: SiteSettings
  categories: Category[]
  links: Link[]
}

const memoryStore: MemoryStore = {
  settings: {
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
  },
  categories: [
    { id: 'cat-1', name: 'Elektronik & Gadget', sort_order: 1 },
    { id: 'cat-2', name: 'Fashion & Aksesoris', sort_order: 2 },
    { id: 'cat-3', name: 'Rekomendasi Terbaik', sort_order: 3 },
  ],
  links: [],
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'global')
      .single()

    if (!error && data) {
      memoryStore.settings = { ...memoryStore.settings, ...data }
      return memoryStore.settings
    }
  } catch (err) {
    console.warn('[DB] Supabase getSiteSettings fallback:', err)
  }
  return memoryStore.settings
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  memoryStore.settings = { ...memoryStore.settings, ...settings, id: 'global' }
  try {
    const supabase = await createClient()
    await supabase.from('site_settings').upsert({
      id: 'global',
      ...memoryStore.settings,
    })
  } catch (err) {
    console.warn('[DB] Supabase updateSiteSettings fallback:', err)
  }
  return memoryStore.settings
}

export async function getCategories(): Promise<(Category & { links: Link[] })[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*, links(*)')
      .order('sort_order', { ascending: true })

    if (!error && data && data.length > 0) {
      memoryStore.categories = data.map((c) => ({
        id: c.id,
        name: c.name,
        sort_order: c.sort_order,
      }))
      return data as (Category & { links: Link[] })[]
    }
  } catch (err) {
    console.warn('[DB] Supabase getCategories fallback:', err)
  }

  // Fallback with linked items
  return memoryStore.categories.map((cat) => ({
    ...cat,
    links: memoryStore.links.filter((l) => l.category_id === cat.id),
  }))
}

export async function createCategory(name: string): Promise<Category> {
  const newOrder = (memoryStore.categories.reduce((max, c) => Math.max(max, c.sort_order), 0) || 0) + 1
  const localCategory: Category = {
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name,
    sort_order: newOrder,
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({ name, sort_order: newOrder })
      .select()
      .single()

    if (!error && data) {
      memoryStore.categories.push(data)
      return data
    }
  } catch (err) {
    console.warn('[DB] Supabase createCategory fallback:', err)
  }

  memoryStore.categories.push(localCategory)
  return localCategory
}

export async function updateCategory(id: string, name: string): Promise<Category | null> {
  const cat = memoryStore.categories.find((c) => c.id === id)
  if (cat) cat.name = name

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .update({ name })
      .eq('id', id)
      .select()
      .single()

    if (!error && data) {
      return data
    }
  } catch (err) {
    console.warn('[DB] Supabase updateCategory fallback:', err)
  }

  return cat || null
}

export async function deleteCategory(id: string): Promise<boolean> {
  memoryStore.categories = memoryStore.categories.filter((c) => c.id !== id)
  memoryStore.links = memoryStore.links.map((l) => (l.category_id === id ? { ...l, category_id: null } : l))

  try {
    const supabase = await createClient()
    await supabase.from('categories').delete().eq('id', id)
  } catch (err) {
    console.warn('[DB] Supabase deleteCategory fallback:', err)
  }
  return true
}

export async function getLinks(categoryId?: string | null): Promise<Link[]> {
  try {
    const supabase = await createClient()
    let query = supabase.from('links').select('*, categories(name)').order('sort_order', { ascending: true })
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query
    if (!error && data) {
      // Sync to local store
      memoryStore.links = data
      return data
    }
  } catch (err) {
    console.warn('[DB] Supabase getLinks fallback:', err)
  }

  if (categoryId) {
    return memoryStore.links.filter((l) => l.category_id === categoryId)
  }
  return memoryStore.links
}

export async function createLink(linkData: {
  title: string
  url: string
  description?: string | null
  price?: string | null
  variant?: string | null
  affiliateUrl?: string | null
  categoryId?: string | null
  imageUrl?: string | null
}): Promise<Link> {
  const newOrder = (memoryStore.links.reduce((max, l) => Math.max(max, l.sort_order), 0) || 0) + 1
  const category = memoryStore.categories.find((c) => c.id === linkData.categoryId)

  const localLink: Link = {
    id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: linkData.title,
    url: linkData.url,
    description: linkData.description || null,
    price: linkData.price || null,
    variant: linkData.variant || null,
    affiliate_url: linkData.affiliateUrl || linkData.url,
    category_id: linkData.categoryId || null,
    image_url: linkData.imageUrl || null,
    is_active: true,
    sort_order: newOrder,
    clicks: 0,
    created_at: new Date().toISOString(),
    categories: category ? { name: category.name } : null,
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('links')
      .insert({
        title: linkData.title,
        url: linkData.url,
        category_id: linkData.categoryId || null,
        is_active: true,
        sort_order: newOrder,
        clicks: 0,
        image_url: linkData.imageUrl || null,
      })
      .select('*, categories(name)')
      .single()

    if (!error && data) {
      const fullLink = {
        ...data,
        description: linkData.description || null,
        price: linkData.price || null,
        variant: linkData.variant || null,
        affiliate_url: linkData.affiliateUrl || linkData.url,
      }
      memoryStore.links.push(fullLink)
      return fullLink
    }
  } catch (err) {
    console.warn('[DB] Supabase createLink fallback:', err)
  }

  memoryStore.links.push(localLink)
  return localLink
}

export async function updateLink(
  id: string,
  linkData: Partial<{
    title: string
    url: string
    description: string | null
    price: string | null
    variant: string | null
    affiliateUrl: string | null
    categoryId: string | null
    imageUrl: string | null
    isActive: boolean
    sortOrder: number
  }>
): Promise<Link | null> {
  const index = memoryStore.links.findIndex((l) => l.id === id)
  if (index !== -1) {
    const current = memoryStore.links[index]
    const category = memoryStore.categories.find((c) => c.id === (linkData.categoryId ?? current.category_id))
    memoryStore.links[index] = {
      ...current,
      title: linkData.title ?? current.title,
      url: linkData.url ?? current.url,
      description: linkData.description ?? current.description,
      price: linkData.price ?? current.price,
      variant: linkData.variant ?? current.variant,
      affiliate_url: linkData.affiliateUrl ?? current.affiliate_url,
      category_id: linkData.categoryId !== undefined ? linkData.categoryId : current.category_id,
      image_url: linkData.imageUrl !== undefined ? linkData.imageUrl : current.image_url,
      is_active: linkData.isActive !== undefined ? linkData.isActive : current.is_active,
      sort_order: linkData.sortOrder !== undefined ? linkData.sortOrder : current.sort_order,
      categories: category ? { name: category.name } : current.categories,
    }
  }

  try {
    const supabase = await createClient()
    const updatePayload: Record<string, unknown> = {}
    if (linkData.title !== undefined) updatePayload.title = linkData.title
    if (linkData.url !== undefined) updatePayload.url = linkData.url
    if (linkData.categoryId !== undefined) updatePayload.category_id = linkData.categoryId
    if (linkData.imageUrl !== undefined) updatePayload.image_url = linkData.imageUrl
    if (linkData.isActive !== undefined) updatePayload.is_active = linkData.isActive
    if (linkData.sortOrder !== undefined) updatePayload.sort_order = linkData.sortOrder

    await supabase.from('links').update(updatePayload).eq('id', id)
  } catch (err) {
    console.warn('[DB] Supabase updateLink fallback:', err)
  }

  return memoryStore.links.find((l) => l.id === id) || null
}

export async function deleteLink(id: string): Promise<boolean> {
  memoryStore.links = memoryStore.links.filter((l) => l.id !== id)
  try {
    const supabase = await createClient()
    await supabase.from('links').delete().eq('id', id)
  } catch (err) {
    console.warn('[DB] Supabase deleteLink fallback:', err)
  }
  return true
}

export async function trackClick(linkId: string): Promise<void> {
  const link = memoryStore.links.find((l) => l.id === linkId)
  if (link) {
    link.clicks = (link.clicks || 0) + 1
  }

  try {
    const supabase = await createClient()
    await Promise.all([
      supabase.rpc('increment_link_clicks', { link_id: linkId }),
      supabase.from('click_logs').insert({ link_id: linkId }),
    ])
  } catch {
    // fallback direct increment if rpc fails
    try {
      const supabase = await createClient()
      if (link) {
        await supabase.from('links').update({ clicks: link.clicks }).eq('id', linkId)
      }
    } catch {
      // ignore
    }
  }
}
