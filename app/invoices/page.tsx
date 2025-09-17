'use client'

import React, { useState, useEffect } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { DataTable, formatDate, formatCurrency } from '@/components/ui/DataTable'
import { Badge } from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { useClients } from '@/contexts/ClientContext'
import { Invoice } from '@/types'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

function InvoicesContent() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { clients } = useClients()
  const { addToast } = useToast()

  const fetchInvoices = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false })

      if (error) throw error

      setInvoices(data || [])
    } catch (error) {
      console.error('Error fetching invoices:', error)
      addToast({
        type: 'error',
        title: 'Error fetching invoices',
        message: 'Failed to load invoices'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [user])

  const getClientName = (clientId?: string) => {
    if (!clientId) return '-'
    const client = clients.find(c => c.id === clientId)
    return client?.name || 'Unknown Client'
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'info'
      case 'draft': return 'warning'
      default: return 'default'
    }
  }

  const getOverdueStatus = (dueDate: string, status: string) => {
    if (status === 'paid') return null
    
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return { status: 'Overdue', variant: 'error' as const }
    } else if (diffDays <= 7) {
      return { status: 'Due Soon', variant: 'warning' as const }
    }
    return null
  }

  const columns = [
    {
      key: 'invoice_number',
      header: 'Invoice #',
      render: (invoice: Invoice) => (
        <div className="font-medium text-gray-900">
          {invoice.invoice_number}
        </div>
      )
    },
    {
      key: 'invoice_date',
      header: 'Date',
      render: (invoice: Invoice) => formatDate(invoice.invoice_date)
    },
    {
      key: 'client',
      header: 'Client',
      render: (invoice: Invoice) => getClientName(invoice.client_id)
    },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (invoice: Invoice) => {
        const overdueStatus = getOverdueStatus(invoice.due_date, invoice.status)
        return (
          <div>
            <div className="text-sm text-gray-900">
              {formatDate(invoice.due_date)}
            </div>
            {overdueStatus && (
              <Badge variant={overdueStatus.variant} size="sm" className="mt-1">
                {overdueStatus.status}
              </Badge>
            )}
          </div>
        )
      }
    },
    {
      key: 'grand_total',
      header: 'Amount',
      render: (invoice: Invoice) => (
        <div className="font-medium text-gray-900">
          {formatCurrency(invoice.grand_total)}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (invoice: Invoice) => (
        <Badge variant={getStatusVariant(invoice.status)} size="sm">
          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (invoice: Invoice) => (
        <div className="flex space-x-2">
          <Link href={`/invoices/${invoice.id}`}>
            <Button size="sm" variant="outline">
              View
            </Button>
          </Link>
          <Link href={`/invoices/${invoice.id}/edit`}>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
          <Link href={`/invoices/${invoice.id}/print`}>
            <Button size="sm" variant="ghost">
              Print
            </Button>
          </Link>
        </div>
      )
    }
  ]

  // Calculate summary stats
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.grand_total, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0)
  const outstandingAmount = totalAmount - paidAmount
  const overdueCount = invoices.filter(inv => {
    const overdueStatus = getOverdueStatus(inv.due_date, inv.status)
    return overdueStatus?.status === 'Overdue'
  }).length

  return (
    <DashboardLayout
      title="Invoices"
      actions={
        <Link href="/invoices/new">
          <Button>+ New Invoice</Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-gray-900">{totalInvoices}</div>
            <div className="text-sm text-gray-500">Total Invoices</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <div className="text-sm text-gray-500">Paid</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(outstandingAmount)}</div>
            <div className="text-sm text-gray-500">Outstanding</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
        </div>

        {/* Invoices Table */}
        <DataTable
          data={invoices}
          columns={columns}
          loading={loading}
          emptyMessage="No invoices found. Create your first invoice to get started."
        />
      </div>
    </DashboardLayout>
  )
}

export default function InvoicesPage() {
  return (
    <AuthGuard>
      <InvoicesContent />
    </AuthGuard>
  )
}