'use client'

import { useState, useEffect, useCallback } from 'react'
import { ServiceChecklist } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function useServiceChecklists() {
  const [checklists, setChecklists] = useState<ServiceChecklist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()

  const fetchChecklists = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('service_checklists')
        .select('*')
        .eq('user_id', user.id)
        .order('completion_date', { ascending: false })

      if (error) throw error

      setChecklists(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch service checklists'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchChecklists()
    } else {
      setChecklists([])
    }
  }, [user, fetchChecklists])

  // Calculate service checklist statistics
  const stats = {
    total: checklists.length,
    current: checklists.filter(c => {
      if (!c.next_service_date) return false
      const nextDate = new Date(c.next_service_date)
      const today = new Date()
      return nextDate > today
    }).length,
    dueSoon: checklists.filter(c => {
      if (!c.next_service_date) return false
      const nextDate = new Date(c.next_service_date)
      const today = new Date()
      const diffTime = nextDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays > 0 && diffDays <= 30
    }).length,
    overdue: checklists.filter(c => {
      if (!c.next_service_date) return false
      const nextDate = new Date(c.next_service_date)
      const today = new Date()
      return nextDate < today
    }).length,
    safeToUse: checklists.filter(c => 
      c.safety_summary?.safe_to_use?.toLowerCase() === 'yes'
    ).length,
    notSafeToUse: checklists.filter(c => 
      c.safety_summary?.safe_to_use?.toLowerCase() === 'no'
    ).length
  }

  return {
    checklists,
    loading,
    error,
    stats,
    fetchChecklists
  }
}