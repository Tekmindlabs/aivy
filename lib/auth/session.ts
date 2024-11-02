import { verify } from 'jsonwebtoken'
import { AUTH_COOKIE_NAME } from './constants'
import { AuthError } from '../utils/error-handler'
import { cookies } from 'next/headers'

export async function validateSession() {
  const cookieStore = cookies()
  const token = cookieStore.get(AUTH_COOKIE_NAME)

  if (!token) {
    throw new AuthError('Unauthorized', 401)
  }

  try {
    const decoded = verify(token.value, process.env.JWT_SECRET!)
    return decoded
  } catch (error) {
    throw new AuthError('Invalid session', 401)
  }
}