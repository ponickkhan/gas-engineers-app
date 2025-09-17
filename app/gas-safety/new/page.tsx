'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { GasSafetyForm } from '@/components/gas-safety/GasSafetyForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { supabase, supabaseClient } from '@/lib/supabase'

function NewGasSafetyContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    if (!user) {
      console.error('No user found in context')
      return
    }

    setIsSubmitting(true)
    try {
      // Check current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session:', session?.user?.id, 'Context user:', user.id)
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error('Authentication session error')
      }

      if (!session?.user) {
        console.error('No active session found')
        throw new Error('No active authentication session')
      }

      const recordData = {
        ...formData,
        user_id: user.id
      }

      console.log('Inserting gas safety record with data:', recordData)

      const { data, error } = await supabase
        .from('gas_safety_records')
        .insert(recordData)
        .select('id')
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from insert operation')
      }

      addToast({
        type: 'success',
        title: 'Gas Safety Record Created',
        message: 'The gas safety record has been created successfully'
      })

      router.push(`/gas-safety/${data.id}`)
    } catch (error: any) {
      console.error('Error creating gas safety record:', error)
      addToast({
        type: 'error',
        title: 'Error Creating Record',
        message: `Failed to create gas safety record: ${error.message || 'Please try again.'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/gas-safety')
  }

  return (
    <DashboardLayout title="New Gas Safety Record">
      <div className="max-w-4xl mx-auto">
        <GasSafetyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </DashboardLayout>
  )
}

export default function NewGasSafetyPage() {
  return (
    <AuthGuard>
      <NewGasSafetyContent />
    </AuthGuard>
  )
}