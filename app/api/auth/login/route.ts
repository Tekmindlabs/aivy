import { NextResponse } from 'next/server'
import { login } from '@/lib/actions/auth'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    const user = await login(email, password)
    
    // Set session cookie
    const cookieStore = cookies()
    cookieStore.set('morphic_session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })

    return new NextResponse(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
      status: 401, // Changed from 500 to 401 for auth errors
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}