import { NextResponse } from 'next/server'
import { signUp } from '@/lib/actions/auth'

export async function POST(request: Request) {
  const { username, email, password } = await request.json()

  try {
    const user = await signUp(username, email, password)
    return new NextResponse(JSON.stringify(user), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
