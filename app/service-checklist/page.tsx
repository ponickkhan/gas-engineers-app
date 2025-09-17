'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { DataTable, formatDate } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { ServiceChecklist } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

function ServiceChecklistContent() {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { clients } = useClients()
  const { addToast } = useToast()

  const fetchChecklists = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('service_checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false })

      if (error) throw error

      setChecklists(data || [])
    } catch (error) {
      console.error('Error fetching service checklists:', error)
      addToast({
        type: 'error',
        title: 'Error fetching checklists',
        message: 'Failed to load service checklists'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChecklists()
  }, [user])

  const getClientName = (clientId?: string) => {
    if (!clientId) return '-'
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getSafetyStatusVariant = (safeToUse?: string) => {
    switch (safeToUse?.toLowerCase()) {
      case 'yes': return 'success'
      case 'no': return 'error'
      default: return 'warning'
    }
  }

  const getGiuspVariant = (classification?: string) => {
    switch (classification) {
      case 'Satisfactory': return 'success'
      case 'Not to Current Standards': return 'warning'
      case 'At Risk': return 'warning'
      case 'Immediately Dangerous': return 'error'
      default: return 'default'
    }
  }

  const getServiceStatus = (checklist: ServiceChecklist) => {
    const nextServiceDate = checklist.next_service_date
    if (!nextServiceDate) return { status: 'No Date Set', variant: 'warning' as const }
    
    const nextDate = new Date(nextServiceDate)
    const today = new Date()
    const diffTime = nextDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'Overdue', variant: 'error' as const }
    } else if (diffDays <= 30) {
      return { status: 'Due Soon', variant: 'warning' as const }
    } else {
      return { status: 'Current', variant: 'success' as const }
    }
  }

  const columns = [
    {
      key: 'completion_date',
      header: 'Date',
      render: (checklist: ServiceChecklist) => 
        checklist.completion_date ? formatDate(checklist.completion_date) : '-'
    },
    {
      key: 'client',
      header: 'Client',
      render: (checklist: ServiceChecklist) => getClientName(checklist.client_id)
    },
    {
      key: 'site_address',
      header: 'Site Address',
      render: (checklist: ServiceChecklist) => {
        const address = checklist.site_details?.address
        const postcode = checklist.site_details?.postcode
        if (!address && !postcode) return '-'
        return (
          <div className="text-sm">
            {address && <div>{address}</div>}
            {postcode && <div className="text-gray-500">{postcode}</div>}
          </div>
        )
      }
    },
    {
      key: 'appliance',
      header: 'Appliance',
      render: (checklist: ServiceChecklist) => {
        const type = checklist.appliance_details?.type
        const location = checklist.appliance_details?.location
        if (!type && !location) return '-'
        return (
          <div className="text-sm">
            {type && <div className="font-medium">{type}</div>}
            {location && <div className="text-gray-500">{location}</div>}
          </div>
        )
      }
    },
    {
      key: 'safety_status',
      header: 'Safety Status',
      render: (checklist: ServiceChecklist) => {
        const safeToUse = checklist.safety_summary?.safe_to_use
        const giusp = checklist.safety_summary?.giusp_classification
        
        return (
          <div className="space-y-1">
            {safeToUse && (
              <Badge variant={getSafetyStatusVariant(safeToUse)} size="sm">
                Safe: {safeToUse}
              </Badge>
            )}
            {giusp && (
              <div>
                <Badge variant={getGiuspVariant(giusp)} size="sm">
                  {giusp}
                </Badge>
              </div>
            )}
          </div>
        )
      }
    },
    {
      key: 'next_service',
      header: 'Next Service',
      render: (checklist: ServiceChecklist) => {
        const { status, variant } = getServiceStatus(checklist)
        return (
          <div>
            {checklist.next_service_date && (
              <div className="text-sm text-gray-900 mb-1">
                {formatDate(checklist.next_service_date)}
              </div>
            )}
            <Badge variant={variant} size="sm">
              {status}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (checklist: ServiceChecklist) => (
        <div className="flex space-x-2">
          <Link href={`/service-checklist/${checklist.id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/service-checklist/${checklist.id}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Link href={`/service-checklist/${checklist.id}/print`}>
            <Button size="sm" variant="ghost">
              Print
            </Button>
          </Link>
        </div>
      )
    }
  ]

  return (
    <DashboardLayout
      title="Service & Maintenance Checklists"
      actions={
        <Link href="/service-checklist/new">
          <Button>+ New Service Checklist</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{checklists.length}</div>
            <div className="text-sm text-gray-500">Total Checklists</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {checklists.filter(c => getServiceStatus(c).variant === 'success').length}
            </div>
            <div className="text-sm text-gray-500">Current</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">
              {checklists.filter(c => getServiceStatus(c).variant === 'warning').length}
            </div>
            <div className="text-sm text-gray-500">Due Soon</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">
              {checklists.filter(c => getServiceStatus(c).variant === 'error').length}
            </div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>

        {/* Checklists Table */}
        <DataTable
          data={checklists}
          columns={columns}
          loading={loading}
          emptyMessage="No service checklists found. Create your first checklist to get started."
        />
      </div>
    </DashboardLayout>
  )
}

export default function ServiceChecklistPage() {
  return (
    <AuthGuard>
      <ServiceChecklistContent />
    </AuthGuard>
  )
}