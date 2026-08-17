import { NextResponse } from 'next/server'
import { getSiteSettings, updateSiteSettings } from '@/lib/db'

export async function GET() {
  try {
    const settings = await getSiteSettings()
    return NextResponse.json(settings)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const updated = await updateSiteSettings(body)
    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save settings'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
