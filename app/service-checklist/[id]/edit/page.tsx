'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { ServiceChecklistForm } from '@/components/service-checklist/ServiceChecklistForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { ServiceChecklist } from '@/types'
import { supabaseClient } from '@/lib/supabase'
import Link from 'next/link'

function EditServiceChecklistContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [checklist, setChecklist] = useState<ServiceChecklist | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const checklistId = params.id as string

  const fetchChecklist = async () => {
    if (!user || !checklistId) return

    setLoading(true)
    try {
      const { data, error } = await supabaseClient
        .from('service_checklists')
        .select('*')
        .eq('id', checklistId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          addToast({
            type: 'error',
            title: 'Checklist not found',
            message: 'The service checklist could not be found.'
          })
          router.push('/service-checklist')
          return
        }
        throw error
      }

      setChecklist(data)
    } catch (error) {
      console.error('Error fetching service checklist:', error)
      addToast({
        type: 'error',
        title: 'Error loading checklist',
        message: 'Failed to load the service checklist.'
      })
      router.push('/service-checklist')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecklist()
  }, [user, checklistId])

  const handleSubmit = async (formData: any) => {
    if (!user || !checklist) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabaseClient
        .from('service_checklists')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', checklist.id)
        .eq('user_id', user.id)
        .select('id')
        .single()

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Checklist Updated',
        message: 'The service checklist has been updated successfully.'
      })

      router.push(`/service-checklist/${checklist.id}`)
    } catch (error: any) {
      console.error('Error updating service checklist:', error)
      addToast({
        type: 'error',
        title: 'Error Updating Checklist',
        message: `Failed to update service checklist: ${error.message || 'Please try again.'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/service-checklist/${checklistId}`)
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading service checklist...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!checklist) {
    return (
      <DashboardLayout title="Checklist Not Found">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Service checklist not found.</div>
            <Link href="/service-checklist">
              <Button>Back to Service Checklists</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`Edit Service Checklist - ${checklist.appliance_details?.type || 'Unknown Appliance'}`}>
      <div className="max-w-4xl mx-auto">
        <ServiceChecklistForm
          initialData={checklist}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </div>
    </DashboardLayout>
  )
}

export default function EditServiceChecklistPage() {
  return (
    <AuthGuard>
      <EditServiceChecklistContent />
    </AuthGuard>
  )
}