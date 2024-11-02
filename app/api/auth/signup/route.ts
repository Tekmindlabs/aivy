import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PASSWORD_RULES } from '@/lib/auth/constants';
import { getRedisClient } from '@/lib/redis/config';
import type { UserSchema } from '@/lib/redis/schema';

interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const { username, email, password }: SignupRequest = await request.json();
    const redis = await getRedisClient();

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUserEmail = await redis.get(`users:email:${email}`);
    if (existingUserEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const userId = `user:${Date.now()}`;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user: UserSchema = {
      id: userId,
      username,
      email,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString()
    };

    // Store in Redis
    await redis.hmset(userId, user);
    await redis.set(`users:email:${email}`, userId);

    // Return user without password
    const { passwordHash: _, ...safeUser } = user;
    
    return NextResponse.json({
      success: true,
      user: safeUser
    }, { status: 201 });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = PASSWORD_RULES;
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}