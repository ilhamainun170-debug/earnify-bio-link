import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  // Increment click count
  const { data: link, error: fetchError } = await supabase
    .from('links')
    .select('clicks')
    .eq('id', id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const { error: updateError } = await supabase
    .from('links')
    .update({ clicks: (link?.clicks || 0) + 1 })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Log the click
  const { error: logError } = await supabase
    .from('click_logs')
    .insert({ link_id: id })

  if (logError) {
    console.error('Failed to log click:', logError)
  }

  return NextResponse.json({ success: true })
}
