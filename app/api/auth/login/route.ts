import { NextResponse } from 'next/server'
import { login } from '@/lib/actions/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  try {
    const user = await login(email, password)
    return new NextResponse(JSON.stringify(user), {
      status: 200,
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
