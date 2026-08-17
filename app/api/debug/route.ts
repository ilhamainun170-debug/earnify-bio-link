import { NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const info: Record<string, unknown> = {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SECRET_KEY,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    supabaseUrlPreview: (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/:\/\/.*@/, '://***@').substring(0, 30),
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ''

  if (supabaseUrl && supabaseKey) {
    try {
      const client = createSupabaseClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
      const { data, error } = await client.from('links').select('*').limit(5)
      info.supabaseQuery = { success: !error, error: error?.message || error, count: data?.length }
    } catch (err: unknown) {
      info.supabaseQuery = { success: false, exception: err instanceof Error ? err.message : String(err) }
    }
  }

  return NextResponse.json(info)
}
