'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { GasSafetyForm } from '@/components/gas-safety/GasSafetyForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { GasSafetyRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

function EditGasSafetyContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [record, setRecord] = useState<GasSafetyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const recordId = params.id as string

  const fetchRecord = async () => {
    if (!user || !recordId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('gas_safety_records')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          addToast({
            type: 'error',
            title: 'Record not found',
            message: 'The gas safety record could not be found.'
          })
          router.push('/gas-safety')
          return
        }
        throw error
      }

      setRecord(data)
    } catch (error) {
      console.error('Error fetching gas safety record:', error)
      addToast({
        type: 'error',
        title: 'Error loading record',
        message: 'Failed to load the gas safety record.'
      })
      router.push('/gas-safety')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecord()
  }, [user, recordId])

  const handleSubmit = async (formData: any) => {
    if (!user || !record) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('gas_safety_records')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id)
        .eq('user_id', user.id)
        .select('id')
        .single()

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Record Updated',
        message: 'The gas safety record has been updated successfully.'
      })

      router.push(`/gas-safety/${record.id}`)
    } catch (error: any) {
      console.error('Error updating gas safety record:', error)
      addToast({
        type: 'error',
        title: 'Error Updating Record',
        message: `Failed to update gas safety record: ${error.message || 'Please try again.'}`
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/gas-safety/${recordId}`)
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading...">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading gas safety record...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (!record) {
    return (
      <DashboardLayout title="Record Not Found">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Gas safety record not found.</div>
            <Link href="/gas-safety">
              <Button>Back to Gas Safety Records</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={`Edit Gas Safety Record - ${record.reference_number || 'No Reference'}`}>
      <div className="max-w-4xl mx-auto">
        <GasSafetyForm
          initialData={record}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="edit"
        />
      </div>
    </DashboardLayout>
  )
}

export default function EditGasSafetyPage() {
  return (
    <AuthGuard>
      <EditGasSafetyContent />
    </AuthGuard>
  )
}