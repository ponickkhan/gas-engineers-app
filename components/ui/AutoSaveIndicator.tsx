'use client'

import React from 'react'
import { useForm } from '@/contexts/FormContext'
import { LoadingSpinner } from './Loading'
import { cn } from '@/utils/cn'

interface AutoSaveIndicatorProps {
  className?: string
  showLastSaved?: boolean
}

export function AutoSaveIndicator({ 
  className, 
  showLastSaved = true 
}: AutoSaveIndicatorProps) {
  const { isAutoSaving, lastSaved, hasUnsavedChanges, autoSaveEnabled } = useForm()

  if (!autoSaveEnabled) return null

  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 30) {
      return 'Just now'
    } else if (diffInSeconds < 60) {
      return 'Less than a minute ago'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return (
    <div className={cn(
      'flex items-center space-x-2 text-sm',
      className
    )}>
      {isAutoSaving ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="text-blue-600">Saving...</span>
        </>
      ) : hasUnsavedChanges ? (
        <>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          <span className="text-yellow-600">Unsaved changes</span>
        </>
      ) : lastSaved ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-green-600">
            {showLastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Saved'}
          </span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-gray-400 rounded-full" />
          <span className="text-gray-500">Not saved</span>
        </>
      )}
    </div>
  )
}

// Floating auto-save indicator for forms
export function FloatingAutoSaveIndicator() {
  const { autoSaveEnabled } = useForm()

  if (!autoSaveEnabled) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-white shadow-lg rounded-lg border p-3">
      <AutoSaveIndicator />
    </div>
  )
}