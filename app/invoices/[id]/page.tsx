'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { InvoiceView } from '@/components/invoices/InvoiceView'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { supabase, supabaseClient } from '@/lib/supabase'
import { Invoice, Database } from '@/types'

function InvoiceDetailContent() {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string

  const fetchInvoice = async () => {
    if (!user || !invoiceId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          addToast({
            type: 'error',
            title: 'Invoice Not Found',
            message: 'The requested invoice could not be found.'
          })
          router.push('/invoices')
          return
        }
        throw error
      }

      setInvoice(data)
    } catch (error) {
      console.error('Error fetching invoice:', error)
      addToast({
        type: 'error',
        title: 'Error Loading Invoice',
        message: 'Failed to load invoice details.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (formData: any) => {
    if (!user || !invoiceId) return

    setIsSubmitting(true)
    try {
      console.log('Updating invoice data:', formData)
      
      // Prepare the data for update
      const invoiceData = {
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        reference_po: formData.reference_po || null,
        client_id: formData.client_id || null,
        bill_to_details: formData.bill_to_details || {},
        line_items: formData.line_items || [],
        subtotal: Number(formData.subtotal) || 0,
        vat_total: Number(formData.vat_total) || 0,
        grand_total: Number(formData.grand_total) || 0,
        notes: formData.notes || null,
        status: formData.status || 'draft'
      } as Partial<Invoice>

      const { data, error } = await supabaseClient
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from update operation')
      }

      console.log('Invoice updated successfully:', data)
      setInvoice(data)
      setEditing(false)

      addToast({
        type: 'success',
        title: 'Invoice Updated',
        message: 'The invoice has been updated successfully'
      })
    } catch (error) {
      console.error('Error updating invoice:', error)
      addToast({
        type: 'error',
        title: 'Error Updating Invoice',
        message: error instanceof Error ? error.message : 'Failed to update invoice. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user || !invoiceId) return

    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id)

      if (error) throw error

      addToast({
        type: 'success',
        title: 'Invoice Deleted',
        message: 'The invoice has been deleted successfully'
      })

      router.push('/invoices')
    } catch (error) {
      console.error('Error deleting invoice:', error)
      addToast({
        type: 'error',
        title: 'Error Deleting Invoice',
        message: 'Failed to delete invoice. Please try again.'
      })
    }
  }

  useEffect(() => {
    fetchInvoice()
  }, [user, invoiceId])

  if (loading) {
    return (
      <DashboardLayout title="Loading Invoice...">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orient-blue"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!invoice) {
    return (
      <DashboardLayout title="Invoice Not Found">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <p className="text-gray-500 mb-4">Invoice not found</p>
          <Button onClick={() => router.push('/invoices')}>
            Back to Invoices
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  if (editing) {
    return (
      <DashboardLayout title={`Edit Invoice ${invoice.invoice_number}`}>
        <div className="max-w-4xl mx-auto">
          <InvoiceForm
            initialData={invoice}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(false)}
            isSubmitting={isSubmitting}
            mode="edit"
          />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title={`Invoice ${invoice.invoice_number}`}
      actions={
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/invoices')}
          >
            Back to Invoices
          </Button>
        </div>
      }
    >
      <div className="max-w-4xl mx-auto">
        <InvoiceView 
          invoice={invoice} 
          onEdit={() => setEditing(true)}
          onPrint={() => {
            // Print functionality is handled within InvoiceView component
            const printContent = document.getElementById('invoice-print-content')
            if (printContent) {
              window.print()
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
}

export default function InvoiceDetailPage() {
  return (
    <AuthGuard>
      <InvoiceDetailContent />
    </AuthGuard>
  )
}