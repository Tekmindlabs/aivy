import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // Make sure to set this in .env

export const verifyToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as { email: string }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export const generateToken = async (email: string) => {
  return jwt.sign({ email }, JWT_SECRET, { expiresIn: '24h' })
}