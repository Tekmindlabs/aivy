'use client'

import LoginForm from '@/components/auth/login-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    if (!email || !password) {
      setErrorMessage('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Important: include credentials
      })

      if (response.ok) {
        const user = await response.json()
        // Force a hard navigation to reload the middleware
        window.location.href = '/'
      } else {
        const error = await response.json()
        setErrorMessage(error.error || 'Invalid credentials')
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        <LoginForm onSubmit={handleSubmit} />
        <p className="text-center">
          Don't have an account? <Link href="/auth/signup">Sign up</Link>
        </p>
      </div>
    </div>
  )
}