'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { PrintPreview } from '@/components/ui/PrintPreview'
import { GasSafetyView } from '@/components/gas-safety/GasSafetyView'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { GasSafetyRecord } from '@/types'
import { supabase } from '@/lib/supabase'

function PrintGasSafetyContent() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading gas safety record...</div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Gas safety record not found.</div>
        </div>
      </div>
    )
  }

  return (
    <PrintPreview
      title={`Gas Safety Record - ${record.reference_number || 'No Reference'}`}
      onBack={() => router.push(`/gas-safety/${recordId}`)}
    >
      <GasSafetyView record={record} />
    </PrintPreview>
  )
}

export default function PrintGasSafetyPage() {
  return (
    <AuthGuard>
      <PrintGasSafetyContent />
    </AuthGuard>
  )
}