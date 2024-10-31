<<<<<<< Updated upstream
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const profileData = await request.json()
    // Add your profile update logic here (name, email, etc.)
    
    return new NextResponse(JSON.stringify({ 
      success: true,
      message: 'Profile updated successfully'
=======
import { getRedisClient } from '@/lib/redis/config'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const decoded = await verifyToken(token.value)
    if (!decoded?.email) {
      return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const redis = await getRedisClient()
    const profile = await redis.hgetall(`profile:${decoded.email}`)

    return new NextResponse(JSON.stringify(profile || {}))
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch profile' }), { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('token')

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    const decoded = await verifyToken(token.value)
    if (!decoded?.email) {
      return new NextResponse(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const profileData = await request.json()
    const redis = await getRedisClient()
    
    await redis.hmset(`profile:${decoded.email}`, profileData)
    const savedProfile = await redis.hgetall(`profile:${decoded.email}`)
    
    return new NextResponse(JSON.stringify({
      success: true,
      message: 'Profile updated successfully',
      profile: savedProfile
>>>>>>> Stashed changes
    }))
  } catch (error) {
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to update profile'
    }), { status: 500 })
  }
<<<<<<< Updated upstream
=======
}

const fetchProfileData = async () => {
  try {
    const response = await fetch('/api/user/profile')
    if (response.status === 401) {
      // Redirect to login page
      window.location.href = '/login'
      return
    }
    if (response.ok) {
      const data = await response.json()
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        age: data.age || '',
        grade: data.grade || '',
        learningPreferences: data.learningPreferences || '',
      })
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    setIsLoading(false)
  }
>>>>>>> Stashed changes
}