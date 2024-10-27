import { User } from '../types/user';
import { redis } from '../redis';
import bcrypt from 'bcrypt';
import { generateId } from 'ai';

export async function signUp(username: string, email: string, password: string): Promise<User> {
  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Store in Redis
  const userId = generateId();
  await redis.set(`users:${userId}`, JSON.stringify({
    id: userId,
    username,
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  }));
  await redis.set(`users:email:${email}`, userId);

  // Return user object
  return {
    id: userId,
    username,
    email,
    createdAt: new Date(),
    passwordHash, 
  };
}

export async function login(email: string, password: string): Promise<User> {
  // Verify credentials
  const userId = await redis.get(`users:email:${email}`);
  if (!userId) {
    throw new Error('Invalid email or password');
  }

  const user = JSON.parse(await redis.get(`users:${userId}`)) as User;
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Return user object
  return user;
}

export async function logout() {
  // Clear session
}
