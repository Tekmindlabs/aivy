import { NextResponse } from 'next/server'
import { logout } from '@/lib/actions/auth'

export async function POST(request: Request) {
  try {
    await logout()
    return new NextResponse(null, {
      status: 204,
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
