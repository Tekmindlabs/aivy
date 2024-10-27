'use client'

import SignUpForm from '@/components/auth/signup-form'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignUpPage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const username = formData.get('username')?.toString()
    const email = formData.get('email')?.toString()
    const password = formData.get('password')?.toString()

    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields')
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        setSuccessMessage('Signup successful! You can now login.')
        setErrorMessage('')
        setTimeout(() => {
          router.push('/auth/login')
        }, 2000)
      } else {
        const error = await response.json()
        setErrorMessage(error.error)
        setSuccessMessage('')
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again later.')
      setSuccessMessage('')
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
      <SignUpForm onSubmit={handleSubmit} />
    </div>
  )
}
