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
      })

      if (response.ok) {
        const user = await response.json()
        router.push('/')
      } else {
        const error = await response.json()
        setErrorMessage(error.error)
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.')
    }
  }

  return (
    <div>
      <h1>Login</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <LoginForm onSubmit={handleSubmit} />
      <p>Don't have an account? <Link href="/auth/signup">Sign up</Link></p>
    </div>
  )
}
