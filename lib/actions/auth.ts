import { User } from '../types/user';
import { getRedisClient } from '../redis/config';
import bcrypt from 'bcrypt';
import { generateId } from 'ai';

export async function signUp(username: string, email: string, password: string): Promise<User> {
  const redis = await getRedisClient();
  
  // Check if email already exists
  const existingUser = await redis.hgetall(`users:email:${email}`);
  if (existingUser && existingUser.userId) {
    throw new Error('Email already registered');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = generateId();
  
  const user: User = {
    id: userId,
    username,
    email,
    createdAt: new Date(),
    passwordHash
  };

  try {
    // Store user data
    await redis.hmset(`users:${userId}`, {
      ...user,
      createdAt: user.createdAt.toISOString()
    });
    
    // Store email lookup
    await redis.hmset(`users:email:${email}`, { userId });

    return user;
  } catch (error) {
    console.error('Error during signup:', error);
    throw new Error('Failed to create user');
  }
}

export interface User {
  id: string
  email: string
  name: string
  password: string
}

export async function login(email: string, password: string): Promise<User> {
  const redis = await getRedisClient()
  
  try {
    console.log('Attempting login for email:', email)
    
    // Get user ID from email index
    const userId = await redis.get(`email:${email}`)
    if (!userId) {
      console.log('User not found for email:', email)
      throw new Error('Invalid credentials')
    }

    // Get user data
    const userData = await redis.get(`user:${userId}`)
    if (!userData) {
      console.log('User data not found for ID:', userId)
      throw new Error('Invalid credentials')
    }

    const user = JSON.parse(userData) as User
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      console.log('Password mismatch for user:', email)
      throw new Error('Invalid credentials')
    }

    return user
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}