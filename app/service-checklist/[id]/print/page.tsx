'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PrintLayout } from '@/components/layout/PrintLayout'
import { ServiceChecklistView } from '@/components/service-checklist/ServiceChecklistView'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { ServiceChecklist } from '@/types'
import { supabase } from '@/lib/supabase'

function PrintServiceChecklistContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [checklist, setChecklist] = useState<ServiceChecklist | null>(null)
  const [loading, setLoading] = useState(true)

  const checklistId = params.id as string

  const fetchChecklist = async () => {
    if (!user || !checklistId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading service checklist...</div>
      </div>
    )
  }

  if (!checklist) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Service checklist not found.</div>
        </div>
      </div>
    )
  }

  return (
    <PrintLayout
      title={`Service Checklist - ${checklist.appliance_details?.type || 'Unknown Appliance'}`}
      orientation="portrait"
    >
      <ServiceChecklistView checklist={checklist} />
    </PrintLayout>
  )
}

export default function PrintServiceChecklistPage() {
  return (
    <AuthGuard>
      <PrintServiceChecklistContent />
    </AuthGuard>
  )
}