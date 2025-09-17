'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { DataTable, formatDate } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Pagination, usePagination } from '@/components/ui/Pagination'
import { LoadingTable } from '@/components/ui/LoadingStates'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { useCache } from '@/hooks/useCache'
import { useRenderPerformance } from '@/hooks/usePerformance'
import { GasSafetyRecord } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'
import { error } from 'console'

function GasSafetyContent() {
  const { user } = useAuth()
  const { clients } = useClients()
  const { addToast } = useToast()
  const { startMeasure, endMeasure } = useRenderPerformance('GasSafetyContent')
  
  // Pagination state
  const pagination = usePagination(25)
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Cached data fetching
  const fetchRecords = async (): Promise<GasSafetyRecord[]> => {
    if (!user) return []

    const { data, error } = await supabase
      .from('gas_safety_records')
      .select('*')
      .eq('user_id', user.id)
      .order('record_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  const { 
    data: records = [], 
    loading, 
    error,
    mutate: refreshRecords 
  } = useCache(
    `gas-safety-records-${user?.id}`,
    fetchRecords,
    { ttl: 2 * 60 * 1000 } // 2 minutes cache
  )

  // Measure render performance
  useEffect(() => {
    startMeasure()
    return () => endMeasure()
  })

  // Filter and search records
  const filteredRecords = useMemo(() => {
    if (!records || !Array.isArray(records)) {
      return []
    }
    
    let filtered = records

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(record => 
        record.reference_number?.toLowerCase().includes(searchLower) ||
        record.engineer_name?.toLowerCase().includes(searchLower) ||
        record.site_details?.address?.toLowerCase().includes(searchLower)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const today = new Date()
      filtered = filtered.filter(record => {
        if (!record.next_inspection_date) return statusFilter === 'no-date'
        
        const nextDate = new Date(record.next_inspection_date)
        const diffTime = nextDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        switch (statusFilter) {
          case 'current':
            return diffDays > 30
          case 'due-soon':
            return diffDays <= 30 && diffDays >= 0
          case 'overdue':
            return diffDays < 0
          case 'no-date':
            return false
          default:
            return true
        }
      })
    }

    return filtered
  }, [records, searchTerm, statusFilter])

  // Paginated records
  const paginatedRecords = useMemo(() => {
    return pagination.getPaginatedData(filteredRecords)
  }, [filteredRecords, pagination])

  // Reset pagination when filters change
  useEffect(() => {
    pagination.reset()
  }, [searchTerm, statusFilter])

  const getClientName = (clientId?: string) => {
    if (!clientId) return '-'
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getRecordStatus = (record: GasSafetyRecord) => {
    const nextInspectionDate = record.next_inspection_date
    if (!nextInspectionDate) return { status: 'No Date Set', variant: 'warning' as const }
    
    const nextDate = new Date(nextInspectionDate)
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
      key: 'record_date',
      header: 'Date',
      render: (record: GasSafetyRecord) => formatDate(record.record_date)
    },
    {
      key: 'reference_number',
      header: 'Reference',
      render: (record: GasSafetyRecord) => record.reference_number || '-'
    },
    {
      key: 'client',
      header: 'Client',
      render: (record: GasSafetyRecord) => getClientName(record.client_id)
    },
    {
      key: 'site_address',
      header: 'Site Address',
      render: (record: GasSafetyRecord) => {
        const address = record.site_details?.address
        const postcode = record.site_details?.postcode
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
      key: 'appliances_count',
      header: 'Appliances',
      render: (record: GasSafetyRecord) => record.appliances?.length || 0
    },
    {
      key: 'next_inspection',
      header: 'Next Inspection',
      render: (record: GasSafetyRecord) => {
        const { status, variant } = getRecordStatus(record)
        return (
          <div>
            {record.next_inspection_date && (
              <div className="text-sm text-gray-900 mb-1">
                {formatDate(record.next_inspection_date)}
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
      render: (record: GasSafetyRecord) => (
        <div className="flex space-x-2">
          <Link href={`/gas-safety/${record.id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/gas-safety/${record.id}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Link href={`/gas-safety/${record.id}/print`}>
            <Button size="sm" variant="ghost">
              Print
            </Button>
          </Link>
        </div>
      )
    }
  ]

  if (error) {
    return (
      <DashboardLayout title="Gas Safety Records">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load gas safety records</div>
          <Button onClick={() => refreshRecords()}>Try Again</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Gas Safety Records"
      actions={
        <Link href="/gas-safety/new">
          <Button>+ New Gas Safety Record</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{records?.length || 0}</div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {records?.filter(r => getRecordStatus(r).variant === 'success').length || 0}
            </div>
            <div className="text-sm text-gray-500">Current</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">
              {records?.filter(r => getRecordStatus(r).variant === 'warning').length || 0}
            </div>
            <div className="text-sm text-gray-500">Due Soon</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">
              {records?.filter(r => getRecordStatus(r).variant === 'error').length || 0}
            </div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by reference, engineer, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Records</option>
                <option value="current">Current</option>
                <option value="due-soon">Due Soon</option>
                <option value="overdue">Overdue</option>
                <option value="no-date">No Date Set</option>
              </select>
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Clear
              </Button>
            )}
          </div>
          
          {filteredRecords.length !== (records?.length || 0) && (
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredRecords.length} of {records?.length || 0} records
            </div>
          )}
        </div>

        {/* Records Table */}
        {loading ? (
          <LoadingTable rows={10} columns={7} />
        ) : (
          <>
            <DataTable
              data={paginatedRecords}
              columns={columns}
              loading={false}
              emptyMessage={
                filteredRecords.length === 0 && (records?.length || 0) > 0
                  ? "No records match your search criteria."
                  : "No gas safety records found. Create your first record to get started."
              }
            />
            
            {/* Pagination */}
            {filteredRecords.length > 0 && (
              <Pagination
                {...pagination.getPaginationProps(filteredRecords.length)}
                className="mt-6"
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default function GasSafetyPage() {
  return (
    <AuthGuard>
      <GasSafetyContent />
    </AuthGuard>
  )
}