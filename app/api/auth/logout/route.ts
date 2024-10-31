import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Clear any auth cookies/session
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    )
    
    // Clear the auth cookie if you're using one
    response.cookies.delete('auth-token') // adjust cookie name as needed
    
    return response
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}