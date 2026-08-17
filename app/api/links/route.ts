import { NextResponse } from 'next/server'
import { getLinks, createLink } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const links = await getLinks(categoryId)
    return NextResponse.json({ links, total: links.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch links'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
    }

    const newLink = await createLink({
      title: body.title,
      url: body.url,
      description: body.description,
      price: body.price,
      variant: body.variant,
      affiliateUrl: body.affiliateUrl,
      categoryId: body.categoryId,
      imageUrl: body.imageUrl,
    })

    return NextResponse.json(newLink)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
