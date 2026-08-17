export interface Link {
  id: string
  title: string
  url: string
  description?: string | null
  price?: string | null
  variant?: string | null
  affiliate_url?: string | null
  category_id: string | null
  is_active: boolean
  sort_order: number
  clicks: number
  created_at: string
  image_url: string | null
  categories?: { name: string } | null
}

export interface Category {
  id: string
  name: string
  sort_order: number
  links?: Link[]
}

export interface ClickLog {
  id: string
  link_id: string
  created_at: string
}

export interface SiteSettings {
  id: string
  logo: string | null
  name: string
  description: string | null
  twitter: string | null
  instagram: string | null
  youtube: string | null
  medium: string | null
  threads: string | null
  pinterest: string | null
  facebook: string | null
}

export interface AnalyticsData {
  totalClicks: number
  totalLinks: number
  topLinks: (Link & { category_name?: string })[]
  clicksPerDay: { date: string; clicks: number }[]
}
