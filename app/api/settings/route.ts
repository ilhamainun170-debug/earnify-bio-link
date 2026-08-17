import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .single()

  if (error) {
    // If no settings exist, return defaults
    if (error.code === 'PGRST116') {
      return NextResponse.json({
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
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({
      id: 'global',
      logo: body.logo,
      name: body.name,
      description: body.description,
      twitter: body.twitter,
      instagram: body.instagram,
      youtube: body.youtube,
      medium: body.medium,
      threads: body.threads,
      pinterest: body.pinterest,
      facebook: body.facebook,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
