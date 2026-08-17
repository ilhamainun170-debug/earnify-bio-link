import { NextResponse } from 'next/server'
import { updateLink, deleteLink } from '@/lib/db'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const updated = await updateLink(id, {
      title: body.title,
      url: body.url,
      description: body.description,
      price: body.price,
      variant: body.variant,
      affiliateUrl: body.affiliateUrl,
      categoryId: body.categoryId,
      imageUrl: body.imageUrl,
      isActive: body.isActive,
      sortOrder: body.sortOrder,
    })

    return NextResponse.json(updated)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteLink(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete link'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
