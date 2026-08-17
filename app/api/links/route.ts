import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const categoryId = searchParams.get('categoryId')
  const search = searchParams.get('search')
  const activeOnly = searchParams.get('activeOnly') === 'true'

  let query = supabase
    .from('links')
    .select('*, categories(name)', { count: 'exact' })
    .order('sort_order', { ascending: true })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    links: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Get the max sort order
  const { data: maxOrderData } = await supabase
    .from('links')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrderData?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('links')
    .insert({
      title: body.title,
      url: body.url,
      category_id: body.categoryId || null,
      is_active: true,
      sort_order: newOrder,
      clicks: 0,
      image_url: body.imageUrl || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
