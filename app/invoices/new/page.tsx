'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { InvoiceForm } from '@/components/invoices/InvoiceForm'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/ui/Toast'
import { supabase, supabaseClient } from '@/lib/supabase'

function NewInvoiceContent() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()

  const handleSubmit = async (formData: any) => {
    if (!user) {
      console.error('No user found')
      addToast({
        type: 'error',
        title: 'Authentication Error',
        message: 'You must be logged in to create an invoice'
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log('User:', user)
      console.log('Submitting invoice data:', formData)
      
      // Validate required fields
      if (!formData.invoice_number) {
        throw new Error('Invoice number is required')
      }
      if (!formData.invoice_date) {
        throw new Error('Invoice date is required')
      }
      if (!formData.due_date) {
        throw new Error('Due date is required')
      }
      if (!formData.line_items || formData.line_items.length === 0) {
        throw new Error('At least one line item is required')
      }

      // Validate line items
      for (const item of formData.line_items) {
        if (!item.description || item.description.trim() === '') {
          throw new Error('All line items must have a description')
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error('All line items must have a valid quantity')
        }
      }
      
      // Prepare the data for insertion
      const invoiceData = {
        user_id: user.id,
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
      }

      console.log('Prepared invoice data:', invoiceData)

      // Test authentication and database connection
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(`Authentication failed: ${authError.message}`)
      }
      
      if (!currentUser) {
        throw new Error('No authenticated user found')
      }
      
      console.log('Current authenticated user:', currentUser.id)
      console.log('User from context:', user.id)
      
      // Check if the session is properly set
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Session error:', sessionError)
        throw new Error(`Session error: ${sessionError.message}`)
      }
      
      if (!session) {
        throw new Error('No active session found')
      }
      
      console.log('Active session found:', session.user.id)
      
      // Test database connection
      const { data: testData, error: testError } = await supabase
        .from('invoices')
        .select('count')
        .eq('user_id', user.id)

      if (testError) {
        console.error('Database connection test failed:', testError)
        throw new Error(`Database connection failed: ${testError.message}`)
      }

      console.log('Database connection test passed')

      // Try inserting with explicit user_id matching the authenticated user
      const finalInvoiceData = {
        ...invoiceData,
        user_id: currentUser.id // Use the authenticated user ID
      }

      console.log('Final invoice data with auth user ID:', finalInvoiceData)

      const { data, error } = await supabaseClient
        .from('invoices')
        .insert(finalInvoiceData)
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        throw new Error('No data returned from insert operation')
      }

      console.log('Invoice created successfully:', data)

      addToast({
        type: 'success',
        title: 'Invoice Created',
        message: 'The invoice has been created successfully'
      })

      router.push(`/invoices/${data.id}`)
    } catch (error) {
      console.error('Error creating invoice:', error)
      addToast({
        type: 'error',
        title: 'Error Creating Invoice',
        message: error instanceof Error ? error.message : 'Failed to create invoice. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push('/invoices')
  }

  return (
    <DashboardLayout title="New Invoice">
      <div className="max-w-4xl mx-auto">
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          mode="create"
        />
      </div>
    </DashboardLayout>
  )
}

export default function NewInvoicePage() {
  return (
    <AuthGuard>
      <NewInvoiceContent />
    </AuthGuard>
  )
}