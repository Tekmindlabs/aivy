'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
<<<<<<< Updated upstream
import { useState } from 'react'
=======
import { useState, useEffect } from 'react'
>>>>>>> Stashed changes
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    grade: '',
    learningPreferences: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
<<<<<<< Updated upstream
=======
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            age: data.age || '',
            grade: data.grade || '',
            learningPreferences: data.learningPreferences || '',
          })
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [])
>>>>>>> Stashed changes

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
<<<<<<< Updated upstream
      if (response.ok) {
        setAlertMessage('Profile updated successfully')
        setShowAlert(true)
=======
      const data = await response.json()
      
      if (response.ok) {
        setFormData(data.profile)
        setAlertMessage('Profile updated successfully')
        setShowAlert(true)
      } else {
        throw new Error(data.error)
>>>>>>> Stashed changes
      }
    } catch (error) {
      setAlertMessage('Failed to update profile')
      setShowAlert(true)
    }
  }

<<<<<<< Updated upstream
const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault()
  try {
    const response = await fetch('/api/user/password', {
      method: 'PATCH',  // Changed from PUT to PATCH
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
    })
=======
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
>>>>>>> Stashed changes

      if (response.ok) {
        setAlertMessage('Password updated successfully')
        setShowAlert(true)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      setAlertMessage('Failed to update password')
      setShowAlert(true)
    }
  }

<<<<<<< Updated upstream
=======
  if (isLoading) {
    return <div>Loading...</div>
  }

>>>>>>> Stashed changes
  return (
    <div className="container mx-auto p-6 mt-16">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
      <Tabs defaultValue="personal">
        <TabsList>
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              />
              <Input 
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <Input 
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
            />
            <Input 
              placeholder="Class/Grade"
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
            />
            <textarea 
              placeholder="Learning Preferences"
              className="w-full min-h-[100px] rounded-md border p-2"
              value={formData.learningPreferences}
              onChange={(e) => setFormData({...formData, learningPreferences: e.target.value})}
            />
            <Button type="submit">Save Changes</Button>
          </form>
        </TabsContent>

        <TabsContent value="password">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input 
              type="password"
              placeholder="Current Password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
            />
            <Input 
              type="password"
              placeholder="New Password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
            <Input 
              type="password"
              placeholder="Confirm New Password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
            <Button type="submit">Update Password</Button>
          </form>
        </TabsContent>
      </Tabs>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Notification</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={() => setShowAlert(false)}>OK</Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}