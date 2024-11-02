// app/api/user/password/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function PATCH(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json()
    
    // Add your password validation and update logic here
    // ...

    // Clear the session cookie
    const cookieStore = cookies()
    cookieStore.delete('Aivy_session', {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return new NextResponse(JSON.stringify({ 
      success: true,
      message: 'Password updated successfully. Please login again.'
    }))
  } catch (error) {
    return new NextResponse(JSON.stringify({ 
      error: (error as Error).message 
    }), { status: 500 })
  }
}