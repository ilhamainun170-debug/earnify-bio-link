import { NextResponse } from 'next/server'
import { getCategories, createCategory } from '@/lib/db'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch categories'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    const newCategory = await createCategory(body.name.trim())
    return NextResponse.json(newCategory)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
