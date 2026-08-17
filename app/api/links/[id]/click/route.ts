import { NextResponse } from 'next/server'
import { trackClick } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await trackClick(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to track click'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
