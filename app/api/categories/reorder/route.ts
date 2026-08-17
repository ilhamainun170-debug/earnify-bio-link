import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { items } = await request.json()

  // Update each category's sort order
  const updates = items.map((item: { id: string; sortOrder: number }) =>
    supabase
      .from('categories')
      .update({ sort_order: item.sortOrder })
      .eq('id', item.id)
  )

  const results = await Promise.all(updates)
  const errors = results.filter((r) => r.error)

  if (errors.length > 0) {
    return NextResponse.json(
      { error: 'Failed to update some items' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
