import { NextResponse } from 'next/server'
import { logout } from '@/lib/actions/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    await logout()
    
    // Clear the session cookie
    const response = new NextResponse(null, {
      status: 204,
    })
    
    // Remove the auth cookie
    response.cookies.set('auth-token', '', {
      expires: new Date(0),
      path: '/',
    })
    
    return response
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}