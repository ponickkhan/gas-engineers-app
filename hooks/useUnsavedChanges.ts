'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from '@/contexts/FormContext'

interface UseUnsavedChangesOptions {
  enabled?: boolean
  message?: string
}

export function useUnsavedChanges({
  enabled = true,
  message = 'You have unsaved changes. Are you sure you want to leave?'
}: UseUnsavedChangesOptions = {}) {
  const { hasUnsavedChanges } = useForm()
  const router = useRouter()

  // Handle browser navigation (refresh, close tab, etc.)
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        event.preventDefault()
        event.returnValue = message
        return message
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [enabled, hasUnsavedChanges, message])

  // Function to check for unsaved changes before navigation
  const checkUnsavedChanges = useCallback((): boolean => {
    if (!enabled || !hasUnsavedChanges) return true

    return window.confirm(message)
  }, [enabled, hasUnsavedChanges, message])

  // Safe navigation function
  const navigateWithCheck = useCallback((path: string) => {
    if (checkUnsavedChanges()) {
      router.push(path)
    }
  }, [checkUnsavedChanges, router])

  return {
    hasUnsavedChanges,
    checkUnsavedChanges,
    navigateWithCheck
  }
}