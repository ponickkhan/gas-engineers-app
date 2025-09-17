'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { GasSafetyView } from '@/components/gas-safety/GasSafetyView'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { GasSafetyRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

function GasSafetyRecordContent() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [record, setRecord] = useState<GasSafetyRecord | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async () => {
    if (!record || !user?.id || !confirm('Are you sure you want to delete this gas safety record?')) return

    try {
      const { error } = await supabase
        .from('gas_safety_records')
        .delete()
        .eq('id', record.id)
        .eq('user_id', user.id)

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Record deleted',
        message: 'The gas safety record has been deleted successfully.'
      })

      router.push('/gas-safety')
    } catch (error) {
      console.error('Error deleting gas safety record:', error)
      addToast({
        type: 'error',
        title: 'Error deleting record',
        message: 'Failed to delete the gas safety record.'
      })
    }
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
    <DashboardLayout
      title={`Gas Safety Record - ${record.reference_number || 'No Reference'}`}
      actions={
        <div className="flex space-x-2">
          <Link href={`/gas-safety/${record.id}/print`}>
            <Button variant="outline">Print</Button>
          </Link>
          <Link href={`/gas-safety/${record.id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            Delete
          </Button>
          <Link href="/gas-safety">
            <Button variant="ghost">Back to List</Button>
          </Link>
        </div>
      }
    >
      <GasSafetyView record={record} />
    </DashboardLayout>
  )
}

export default function GasSafetyRecordPage() {
  return (
    <AuthGuard>
      <GasSafetyRecordContent />
    </AuthGuard>
  )
}