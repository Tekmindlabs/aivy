import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth/constants'
import { rateLimiter } from '@/lib/auth/middleware'
import { getRedisClient } from '@/lib/redis/config'

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimit = rateLimiter(request as any)
  if (rateLimit) return rateLimit

  try {
    const { email, password } = await request.json()
    const redis = await getRedisClient()

    // Get user ID from email index
    const emailLookup = await redis.hgetall(`users:email:${email}`)
    if (!emailLookup || !emailLookup.userId) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Get user data using the ID
    const userData = await redis.hgetall(`users:${emailLookup.userId}`)
    if (!userData) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await bcrypt.compare(password, userData.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = sign(
      { userId: userData.id, email: userData.email },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    const response = NextResponse.json({ success: true })
    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}