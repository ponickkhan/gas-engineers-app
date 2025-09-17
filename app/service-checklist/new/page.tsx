'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { ServiceChecklistForm } from '@/components/service-checklist/ServiceChecklistForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { supabase, supabaseClient } from '@/lib/supabase'

function NewServiceChecklistContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabaseClient
        .from('service_checklists')
        .insert({
          ...formData,
          user_id: user.id
        })
        .select()
        .single() as { data: { id: string } | null, error: any }

      if (error) throw error

      if (!data) {
        throw new Error('No data returned from insert operation')
      }

      addToast({
        type: 'success',
        title: 'Service Checklist Created',
        message: 'The service checklist has been created successfully'
      })

      router.push(`/service-checklist/${data.id}`)
    } catch (error) {
      console.error('Error creating service checklist:', error)
      addToast({
        type: 'error',
        title: 'Error Creating Checklist',
        message: 'Failed to create service checklist. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/service-checklist')
  }

  return (
    <DashboardLayout title="New Service & Maintenance Checklist">
      <div className="max-w-4xl mx-auto">
        <ServiceChecklistForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </DashboardLayout>
  )
}

export default function NewServiceChecklistPage() {
  return (
    <AuthGuard>
      <NewServiceChecklistContent />
    </AuthGuard>
  )
}