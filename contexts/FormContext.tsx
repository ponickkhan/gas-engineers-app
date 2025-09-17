'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react'
import { FormDraft } from '@/types'
import { useAuth } from './AuthContext'
import { supabase, supabaseClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'

interface FormContextType {
  // Auto-save state
  isAutoSaving: boolean
  lastSaved: Date | null
  autoSaveEnabled: boolean
  
  // Form draft management
  saveDraft: (formType: 'gas_safety' | 'invoice' | 'service_checklist', formData: Record<string, any>) => Promise<void>
  loadDraft: (formType: 'gas_safety' | 'invoice' | 'service_checklist') => Promise<Record<string, any> | null>
  deleteDraft: (formType: 'gas_safety' | 'invoice' | 'service_checklist') => Promise<void>
  hasDraft: (formType: 'gas_safety' | 'invoice' | 'service_checklist') => Promise<boolean>
  
  // Auto-save control
  enableAutoSave: () => void
  disableAutoSave: () => void
  
  // Unsaved changes tracking
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useForm must be used within a FormProvider')
  }
  return context
}

interface FormProviderProps {
  children: ReactNode
}

export function FormProvider({ children }: FormProviderProps) {
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  const { user } = useAuth()
  const { addToast } = useToast()

  const saveDraft = useCallback(async (
    formType: 'gas_safety' | 'invoice' | 'service_checklist',
    formData: Record<string, any>
  ) => {
    if (!user) return

    setIsAutoSaving(true)
    try {
      console.log('Saving draft for', formType, formData)
      
      // Skip if form data is empty or only contains default values
      const hasMeaningfulData = Object.values(formData).some(value => {
        if (typeof value === 'string') return value.trim() !== ''
        if (typeof value === 'number') return value !== 0
        if (Array.isArray(value)) return value.length > 0 && value.some(item => 
          typeof item === 'object' ? Object.values(item).some(v => v !== '' && v !== null && v !== undefined) : item !== ''
        )
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(v => v !== '' && v !== null && v !== undefined)
        }
        return value !== null && value !== undefined
      })

      if (!hasMeaningfulData) {
        console.log('No meaningful data to save')
        setIsAutoSaving(false)
        return
      }

      // Use upsert to handle both insert and update
      const { error } = await supabaseClient
        .from('form_drafts')
        .upsert({
          user_id: user.id,
          form_type: formType,
          form_data: formData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,form_type'
        })

      if (error) {
        console.error('Draft save error:', error)
        throw error
      }

      console.log('Draft saved successfully')
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('Error saving draft:', error)
      addToast({
        type: 'error',
        title: 'Auto-save failed',
        message: 'Failed to save form draft'
      })
    } finally {
      setIsAutoSaving(false)
    }
  }, [user, addToast])

  const loadDraft = useCallback(async (
    formType: 'gas_safety' | 'invoice' | 'service_checklist'
  ): Promise<Record<string, any> | null> => {
    if (!user) return null

    try {
      const { data, error } = await supabaseClient
        .from('form_drafts')
        .select('form_data, updated_at')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No draft found
          return null
        }
        throw error
      }

      return data.form_data
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }, [user])

  const deleteDraft = useCallback(async (
    formType: 'gas_safety' | 'invoice' | 'service_checklist'
  ) => {
    if (!user) return

    try {
      const { error } = await supabaseClient
        .from('form_drafts')
        .delete()
        .eq('user_id', user.id)
        .eq('form_type', formType)

      if (error) throw error

      setHasUnsavedChanges(false)
      setLastSaved(null)
    } catch (error) {
      console.error('Error deleting draft:', error)
    }
  }, [user])

  const hasDraft = useCallback(async (
    formType: 'gas_safety' | 'invoice' | 'service_checklist'
  ): Promise<boolean> => {
    if (!user) return false

    try {
      const { data, error } = await supabaseClient
        .from('form_drafts')
        .select('id')
        .eq('user_id', user.id)
        .eq('form_type', formType)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return false
        }
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking for draft:', error)
      return false
    }
  }, [user])

  const enableAutoSave = useCallback(() => {
    setAutoSaveEnabled(true)
  }, [])

  const disableAutoSave = useCallback(() => {
    setAutoSaveEnabled(false)
  }, [])

  const value: FormContextType = {
    isAutoSaving,
    lastSaved,
    autoSaveEnabled,
    saveDraft,
    loadDraft,
    deleteDraft,
    hasDraft,
    enableAutoSave,
    disableAutoSave,
    hasUnsavedChanges,
    setHasUnsavedChanges
  }

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  )
}