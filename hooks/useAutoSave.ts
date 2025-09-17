'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useForm } from '@/contexts/FormContext'
import { useToast } from '@/components/ui/Toast'

interface UseAutoSaveOptions {
  formType: 'gas_safety' | 'invoice' | 'service_checklist'
  formData: Record<string, any>
  interval?: number // Auto-save interval in milliseconds (default: 30 seconds)
  enabled?: boolean
  onSave?: () => void
  onError?: (error: Error) => void
}

export function useAutoSave({
  formType,
  formData,
  interval = 30000, // 30 seconds
  enabled = true,
  onSave,
  onError
}: UseAutoSaveOptions) {
  const {
    saveDraft,
    isAutoSaving,
    lastSaved,
    autoSaveEnabled,
    setHasUnsavedChanges
  } = useForm()
  
  const { addToast } = useToast()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastFormDataRef = useRef<string>('')
  const isInitialRender = useRef(true)

  // Function to perform auto-save
  const performAutoSave = useCallback(async () => {
    if (!enabled || !autoSaveEnabled || isAutoSaving) return

    const currentFormDataString = JSON.stringify(formData)
    
    // Skip if form data hasn't changed
    if (currentFormDataString === lastFormDataRef.current) return

    try {
      await saveDraft(formType, formData)
      lastFormDataRef.current = currentFormDataString
      onSave?.()
      
      // Show subtle success indicator only after the first auto-save
      if (!isInitialRender.current) {
        addToast({
          type: 'info',
          title: 'Draft saved',
          message: 'Your progress has been automatically saved',
          duration: 2000
        })
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Auto-save failed')
      onError?.(err)
      console.error('Auto-save error:', err)
    }
  }, [
    enabled,
    autoSaveEnabled,
    isAutoSaving,
    formData,
    formType,
    saveDraft,
    onSave,
    onError,
    addToast
  ])

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled || !autoSaveEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(performAutoSave, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, autoSaveEnabled, interval, performAutoSave])

  // Track form data changes
  useEffect(() => {
    const currentFormDataString = JSON.stringify(formData)
    const hasChanges = currentFormDataString !== lastFormDataRef.current
    
    if (hasChanges && !isInitialRender.current) {
      setHasUnsavedChanges(true)
    }
    
    if (isInitialRender.current) {
      isInitialRender.current = false
      lastFormDataRef.current = currentFormDataString
    }
  }, [formData, setHasUnsavedChanges])

  // Manual save function
  const saveNow = useCallback(async () => {
    await performAutoSave()
  }, [performAutoSave])

  return {
    isAutoSaving,
    lastSaved,
    saveNow,
    autoSaveEnabled
  }
}