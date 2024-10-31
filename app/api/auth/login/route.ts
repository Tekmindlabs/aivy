import { NextResponse } from 'next/server'
import { login } from '@/lib/actions/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400 }
      )
    }

    const user = await login(email, password)
    
    const cookieStore = cookies()
    cookieStore.set('Aivy_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return new NextResponse(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Login error:', error)
    return new NextResponse(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}