'use client'

import { useState, useEffect } from 'react'
import { supabase, supabaseClient } from '@/lib/supabase'
import { GasSafetyRecord } from '@/types'
import { useAuth } from '@/contexts/AuthContext'

interface GasSafetyStats {
  total: number
  thisMonth: number
  pending: number
  completed: number
}

export function useGasSafetyRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState<GasSafetyRecord[]>([])
  const [stats, setStats] = useState<GasSafetyStats>({
    total: 0,
    thisMonth: 0,
    pending: 0,
    completed: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabaseClient
        .from('gas_safety_records')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setRecords(data || [])

      // Calculate stats
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const total = data?.length || 0
      const thisMonthCount = data?.filter(record => 
        new Date(record.created_at) >= thisMonth
      ).length || 0
      
      const pending = data?.filter(record => 
        record.status === 'pending' || record.status === 'draft'
      ).length || 0
      
      const completed = data?.filter(record => 
        record.status === 'completed'
      ).length || 0

      setStats({
        total,
        thisMonth: thisMonthCount,
        pending,
        completed
      })

    } catch (err) {
      console.error('Error fetching gas safety records:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }

  const createRecord = async (recordData: Omit<GasSafetyRecord, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabaseClient
        .from('gas_safety_records')
        .insert([{
          ...recordData,
          user_id: user.id
        }])
        .select(`
          *,
          client:clients(*)
        `)
        .single()

      if (error) throw error

      setRecords(prev => [data, ...prev])
      await fetchRecords() // Refresh stats
      return data

    } catch (err) {
      console.error('Error creating gas safety record:', err)
      throw err
    }
  }

  const updateRecord = async (id: string, updates: Partial<GasSafetyRecord>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { data, error } = await supabaseClient
        .from('gas_safety_records')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          client:clients(*)
        `)
        .single()

      if (error) throw error

      setRecords(prev => prev.map(record => 
        record.id === id ? data : record
      ))
      await fetchRecords() // Refresh stats
      return data

    } catch (err) {
      console.error('Error updating gas safety record:', err)
      throw err
    }
  }

  const deleteRecord = async (id: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const { error } = await supabaseClient
        .from('gas_safety_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setRecords(prev => prev.filter(record => record.id !== id))
      await fetchRecords() // Refresh stats

    } catch (err) {
      console.error('Error deleting gas safety record:', err)
      throw err
    }
  }

  const getRecentRecords = (limit: number = 5) => {
    return records.slice(0, limit)
  }

  useEffect(() => {
    fetchRecords()
  }, [user])

  return {
    records,
    stats,
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    getRecentRecords,
    refetch: fetchRecords
  }
}