import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check if admin route is being accessed
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const adminSession = request.cookies.get('admin_session')
    
    // If no session cookie, redirect to login
    if (!adminSession || adminSession.value !== 'authenticated') {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  
  // If already logged in and trying to access login page, redirect to admin
  if (request.nextUrl.pathname === '/login') {
    const adminSession = request.cookies.get('admin_session')
    if (adminSession && adminSession.value === 'authenticated') {
      const url = request.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/login',
  ],
}
