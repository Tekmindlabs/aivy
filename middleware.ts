import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants'

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)
  
  // Protected routes
  const protectedPaths = ['/dashboard', '/profile']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*']
}
