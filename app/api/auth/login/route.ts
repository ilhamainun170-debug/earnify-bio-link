import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const isValid =
      password === '051102' ||
      (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD)

    if (isValid) {
      const response = NextResponse.json({ success: true })
      
      // Set admin session cookie as a browser session cookie (cleared when browser closes)
      response.cookies.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { error: 'Invalid password' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

