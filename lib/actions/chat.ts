'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '@/lib/types'
import { getRedisClient, RedisWrapper } from '@/lib/redis/config'
import { MemoryService } from '../services/memory'

const memoryService = new MemoryService();

async function getRedis(): Promise<RedisWrapper> {
  return await getRedisClient()
}

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {
    const redis = await getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
      rev: true
    })

    if (chats.length === 0) {
      return []
    }

    const results = await Promise.all(
      chats.map(async chatKey => {
        const chat = await redis.hgetall(chatKey)
        return chat
      })
    )

    return results
      .filter((result): result is Record<string, any> => {
        if (result === null || Object.keys(result).length === 0) {
          return false
        }
        return true
      })
      .map(chat => {
        const plainChat = { ...chat }
        if (typeof plainChat.messages === 'string') {
          try {
            plainChat.messages = JSON.parse(plainChat.messages)
          } catch (error) {
            plainChat.messages = []
          }
        }
        if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
          plainChat.createdAt = new Date(plainChat.createdAt)
        }
        return plainChat as Chat
      })
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string = 'anonymous') {
  try {
    const redis = await getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat) {
      return null
    }

    if (typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages)
        // Get related memories for context
        const lastMessage = chat.messages[chat.messages.length - 1]
        if (lastMessage?.role === 'user') {
          const memories = await memoryService.searchMemories(lastMessage.content, userId)
          chat.relatedMemories = memories
        }
      } catch (error) {
        chat.messages = []
      }
    }

    if (!Array.isArray(chat.messages)) {
      chat.messages = []
    }

    return chat
  } catch (error) {
    console.error('Failed to get chat:', error)
    return null
  }
}

export async function clearChats(
  userId: string = 'anonymous'
): Promise<{ error?: string }> {
  try {
    const redis = await getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1)
    if (!chats.length) {
      return { error: 'No chats to clear' }
    }

    // Clear Redis chats
    const pipeline = redis.pipeline()
    for (const chat of chats) {
      pipeline.del(chat)
      pipeline.zrem(`user:chat:${userId}`, chat)
    }
    await pipeline.exec()

    // Clear memories
    await memoryService.deleteAllMemories(userId)

    revalidatePath('/')
    redirect('/')
  } catch (error) {
    return { error: 'Failed to clear chats and memories' }
  }
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    const redis = await getRedis()
    const pipeline = redis.pipeline()

    // Save to Redis
    const chatToSave = {
      ...chat,
      messages: JSON.stringify(chat.messages)
    }

    pipeline.hmset(`chat:${chat.id}`, chatToSave)
    pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.id}`)

    // Save last user message to memory
    const lastMessage = chat.messages[chat.messages.length - 1]
    if (lastMessage?.role === 'user') {
      await memoryService.addMemory(lastMessage.content, userId, {
        chatId: chat.id,
        timestamp: Date.now()
      })
    }

    const results = await pipeline.exec()
    return results
  } catch (error) {
    console.error('Failed to save chat:', error)
    throw error
  }
}

export async function getSharedChat(id: string) {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  const redis = await getRedis()
  const chat = await redis.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== userId) {
    return null
  }

  const payload = {
    ...chat,
    sharePath: `/share/${id}`
  }

  await redis.hmset(`chat:${id}`, payload)

  return payload
}
