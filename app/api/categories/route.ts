import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('*, links(*)')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sort links within each category
  const categoriesWithSortedLinks = data?.map((category) => ({
    ...category,
    links: category.links?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  }))

  return NextResponse.json(categoriesWithSortedLinks)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  // Get the max sort order
  const { data: maxOrderData } = await supabase
    .from('categories')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const newOrder = (maxOrderData?.sort_order || 0) + 1

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: body.name,
      sort_order: newOrder,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
