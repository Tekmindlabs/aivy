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

export async function login(email: string, password: string): Promise<User> {
  const redis = await getRedisClient();

  try {
    // Get userId from email lookup
    const userIdObj = await redis.hgetall<Record<string, string>>(`users:email:${email}`);
    if (!userIdObj || !userIdObj.userId) {
      throw new Error('Invalid email or password');
    }

    // Get user data
    const userObj = await redis.hgetall<Record<string, string>>(`users:${userIdObj.userId}`);
    if (!userObj) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userObj.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Convert stored date string back to Date object
    const user: User = {
      id: userObj.id,
      username: userObj.username,
      email: userObj.email,
      passwordHash: userObj.passwordHash,
      createdAt: new Date(userObj.createdAt)
    };

    return user;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
}

export async function logout(): Promise<void> {
  // Implement session clearing logic here
  // This depends on your session management strategy
}