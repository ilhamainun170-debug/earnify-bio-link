import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Reset all link click counts to 0
  const { error: resetError } = await supabase
    .from('links')
    .update({ clicks: 0 })
    .gte('clicks', 0)

  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 500 })
  }

  // Delete all click logs
  const { error: deleteError } = await supabase
    .from('click_logs')
    .delete()
    .gte('created_at', '1970-01-01')

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
