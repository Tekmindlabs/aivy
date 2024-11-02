'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { getRedisClient, RedisWrapper } from '@/lib/redis/config'

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}

export async function getChats(userId?: string | null) {
  if (!userId) return []

  try {
    const redis = await getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    if (!chats.length) return []

    const results = await Promise.all(
      chats.map(async chatKey => {
        const chat = await redis.hgetall(chatKey)
        return chat
      })
    )

    return results
      .filter((result): result is Record<string, any> => {
        if (!result || Object.keys(result).length === 0) return false
        return result.userId === userId // Ensure chat belongs to user
      })
      .map(chat => ({
        ...chat,
        messages: typeof chat.messages === 'string' 
          ? JSON.parse(chat.messages) 
          : [],
        createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date()
      })) as Chat[]
  } catch (error) {
    console.error('Error fetching chats:', error)
    return []
  }
}

export async function getChat(id: string, userId: string) {
  if (!id || !userId) return null
  
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== userId) return null

  try {
    return {
      ...chat,
      messages: typeof chat.messages === 'string' 
        ? JSON.parse(chat.messages) 
        : [],
      createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date()
    }
  } catch (error) {
    console.error('Error parsing chat:', error)
    return null
  }
}

export async function clearChats(userId: string): Promise<{ error?: string }> {
  if (!userId) {
    return { error: 'User ID is required' }
  }

  try {
    const redis = await getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1)
    
    if (!chats.length) {
      return { error: 'No chats to clear' }
    }

    const pipeline = redis.pipeline()
    
    // Make sure we're using the correct key format
    chats.forEach(chatId => {
      pipeline.del(`chat:${chatId}`)
      pipeline.zrem(`user:chat:${userId}`, chatId)
    })

    await pipeline.exec()
    revalidatePath('/')
    return {}
  } catch (error) {
    console.error('Error clearing chats:', error)
    return { error: 'Failed to clear chats' }
  }
}

export async function saveChat(chat: Chat, userId: string) {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    const redis = await getRedis()
    const pipeline = redis.pipeline()

    const chatToSave = {
      ...chat,
      userId,
      messages: JSON.stringify(chat.messages)
    }

    // Use the correct key format
    pipeline.hmset(`chat:${chat.id}`, chatToSave)
    pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.id}`)

    await pipeline.exec()
    revalidatePath('/')
    return chatToSave
  } catch (error) {
    console.error('Error saving chat:', error)
    throw error
  }
}
export async function getSharedChat(id: string) {
  if (!id) return null
  
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) return null

  try {
    return {
      ...chat,
      messages: typeof chat.messages === 'string' 
        ? JSON.parse(chat.messages) 
        : [],
      createdAt: chat.createdAt ? new Date(chat.createdAt) : new Date()
    }
  } catch (error) {
    console.error('Error parsing shared chat:', error)
    return null
  }
}

export async function shareChat(id: string, userId: string) {
  if (!id || !userId) return null

  try {
    const redis = await getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || chat.userId !== userId) return null

    const payload = {
      ...chat,
      sharePath: `/share/${id}`
    }

    await redis.hmset(`chat:${id}`, payload)
    return payload
  } catch (error) {
    console.error('Error sharing chat:', error)
    return null
  }
}