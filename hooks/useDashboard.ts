'use client'

import { useState, useEffect } from 'react'
import { supabase, supabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export interface RecentActivity {
  id: string
  type: 'gas_safety' | 'invoice' | 'service_checklist'
  title: string
  date: string
  status?: string
  client_name?: string
}

export interface DashboardStats {
  totalClients: number
  totalGasSafety: number
  totalInvoices: number
  totalServiceChecklists: number
  totalRevenue: number
  outstandingAmount: number
  overdueCount: number
  thisMonthRecords: number
  upcomingInspections: number
  recentRecords: number
}

export function useDashboard() {
  const { user } = useAuth()
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    totalGasSafety: 0,
    totalInvoices: 0,
    totalServiceChecklists: 0,
    totalRevenue: 0,
    outstandingAmount: 0,
    overdueCount: 0,
    thisMonthRecords: 0,
    upcomingInspections: 0,
    recentRecords: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Start with just clients to test basic connectivity
      const clientsResult = await supabaseClient
        .from('clients')
        .select('id, name, created_at')
        .eq('user_id', user.id)

      if (clientsResult.error) {
        throw new Error(`Clients query failed: ${clientsResult.error.message}`)
      }

      const clients = clientsResult.data || []

      // Try gas safety records
      const gasSafetyResult = await supabaseClient
        .from('gas_safety_records')
        .select('id, site_details, created_at, client_id, next_inspection_date')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (gasSafetyResult.error) {
        console.warn('Gas safety records query failed:', gasSafetyResult.error)
      }

      const gasSafetyRecords = gasSafetyResult.data || []

      // Try invoices
      const invoicesResult = await supabaseClient
        .from('invoices')
        .select('id, invoice_number, grand_total, status, due_date, created_at, client_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (invoicesResult.error) {
        console.warn('Invoices query failed:', invoicesResult.error)
      }

      const invoices = invoicesResult.data || []

      // Try service checklists
      const serviceChecklistsResult = await supabaseClient
        .from('service_checklists')
        .select('id, site_details, created_at, client_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (serviceChecklistsResult.error) {
        console.warn('Service checklists query failed:', serviceChecklistsResult.error)
      }

      const serviceChecklists = serviceChecklistsResult.data || []

      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + (Number(inv.grand_total) || 0), 0)
      
      const outstandingAmount = invoices
        .filter(inv => inv.status === 'sent' || inv.status === 'draft')
        .reduce((sum, inv) => sum + (Number(inv.grand_total) || 0), 0)
      
      const overdueCount = invoices
        .filter(inv => {
          if (inv.status !== 'sent') return false
          const dueDate = new Date(inv.due_date)
          return dueDate < now
        }).length

      const thisMonthRecords = [
        ...gasSafetyRecords.filter(r => new Date(r.created_at) >= thisMonth),
        ...invoices.filter(r => new Date(r.created_at) >= thisMonth),
        ...serviceChecklists.filter(r => new Date(r.created_at) >= thisMonth)
      ].length

      // Calculate upcoming inspections (gas safety records with next_inspection_date in next 30 days)
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const upcomingInspections = gasSafetyRecords.filter(record => {
        if (!record.next_inspection_date) return false
        const nextInspection = new Date(record.next_inspection_date)
        return nextInspection >= now && nextInspection <= nextMonth
      }).length

      // Recent records (last 7 days)
      const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      const recentRecords = [
        ...gasSafetyRecords.filter(r => new Date(r.created_at) >= lastWeek),
        ...invoices.filter(r => new Date(r.created_at) >= lastWeek),
        ...serviceChecklists.filter(r => new Date(r.created_at) >= lastWeek)
      ].length

      setStats({
        totalClients: clients.length,
        totalGasSafety: gasSafetyRecords.length,
        totalInvoices: invoices.length,
        totalServiceChecklists: serviceChecklists.length,
        totalRevenue,
        outstandingAmount,
        overdueCount,
        thisMonthRecords,
        upcomingInspections,
        recentRecords
      })

      // Create a client lookup map
      const clientMap = new Map(clients.map(client => [client.id, client.name]))

      // Combine recent activity from all sources
      const activities: RecentActivity[] = [
        ...gasSafetyRecords.slice(0, 10).map(record => ({
          id: record.id,
          type: 'gas_safety' as const,
          title: (record.site_details as any)?.address || 'Gas Safety Record',
          date: record.created_at,
          status: 'completed',
          client_name: record.client_id ? clientMap.get(record.client_id) : undefined
        })),
        ...invoices.slice(0, 10).map(invoice => ({
          id: invoice.id,
          type: 'invoice' as const,
          title: invoice.invoice_number || 'Invoice',
          date: invoice.created_at,
          status: invoice.status,
          client_name: invoice.client_id ? clientMap.get(invoice.client_id) : undefined
        })),
        ...serviceChecklists.slice(0, 10).map(checklist => ({
          id: checklist.id,
          type: 'service_checklist' as const,
          title: (checklist.site_details as any)?.address || 'Service Checklist',
          date: checklist.created_at,
          status: 'completed',
          client_name: checklist.client_id ? clientMap.get(checklist.client_id) : undefined
        }))
      ]

      // Sort by date and take the most recent 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activities.slice(0, 10))

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  return {
    recentActivity,
    stats,
    loading,
    error,
    refetch: fetchDashboardData
  }
}