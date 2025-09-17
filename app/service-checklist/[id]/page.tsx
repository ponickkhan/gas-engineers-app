'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { ServiceChecklistView } from '@/components/service-checklist/ServiceChecklistView'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { ServiceChecklist } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function ServiceChecklistRecordContent() {
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

  const handleDelete = async () => {
    if (!checklist || !confirm('Are you sure you want to delete this service checklist?')) return

    try {
      const { error } = await supabase
        .from('service_checklists')
        .delete()
        .eq('id', checklist.id)
        .eq('user_id', user?.id)

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Checklist deleted',
        message: 'The service checklist has been deleted successfully.'
      })

      router.push('/service-checklist')
    } catch (error) {
      console.error('Error deleting service checklist:', error)
      addToast({
        type: 'error',
        title: 'Error deleting checklist',
        message: 'Failed to delete the service checklist.'
      })
    }
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
    <DashboardLayout
      title={`Service Checklist - ${checklist.appliance_details?.type || 'Unknown Appliance'}`}
      actions={
        <div className="flex space-x-2">
          <Link href={`/service-checklist/${checklist.id}/print`}>
            <Button variant="outline">Print</Button>
          </Link>
          <Link href={`/service-checklist/${checklist.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            Delete
          </Button>
          <Link href="/service-checklist">
            <Button variant="ghost">Back to List</Button>
          </Link>
        </div>
      }
    >
      <ServiceChecklistView checklist={checklist} />
    </DashboardLayout>
  )
}

export default function ServiceChecklistRecordPage() {
  return (
    <AuthGuard>
      <ServiceChecklistRecordContent />
    </AuthGuard>
  )
}