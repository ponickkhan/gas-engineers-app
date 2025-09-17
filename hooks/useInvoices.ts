'use client'

import { useState, useEffect, useCallback } from 'react'
import { Invoice } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  const fetchInvoices = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false })

      if (error) throw error

      setInvoices(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch invoices'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchInvoices()
    } else {
      setInvoices([])
    }
  }, [user, fetchInvoices])

  // Calculate invoice statistics
  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.grand_total, 0),
    paidAmount: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0),
    outstandingAmount: invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.grand_total, 0),
    overdueCount: invoices.filter(inv => {
      if (inv.status === 'paid') return false
      const due = new Date(inv.due_date)
      const today = new Date()
      return due < today
    }).length
  }

  return {
    invoices,
    loading,
    error,
    stats,
    fetchInvoices
  }
}