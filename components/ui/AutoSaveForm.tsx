'use client'

import React, { ReactNode, useEffect } from 'react'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { AutoSaveIndicator } from './AutoSaveIndicator'
import { DraftRestoration } from './DraftRestoration'
import { cn } from '@/utils/cn'

interface AutoSaveFormProps {
  children: ReactNode
  formType: 'gas_safety' | 'invoice' | 'service_checklist'
  formData: Record<string, any>
  onDraftRestore?: (draftData: Record<string, any>) => void
  onDraftDiscard?: () => void
  autoSaveInterval?: number
  enableAutoSave?: boolean
  enableUnsavedWarning?: boolean
  showAutoSaveIndicator?: boolean
  showDraftRestoration?: boolean
  className?: string
}

export function AutoSaveForm({
  children,
  formType,
  formData,
  onDraftRestore,
  onDraftDiscard,
  autoSaveInterval = 30000,
  enableAutoSave = true,
  enableUnsavedWarning = true,
  showAutoSaveIndicator = true,
  showDraftRestoration = true,
  className
}: AutoSaveFormProps) {
  const { isAutoSaving, lastSaved, saveNow } = useAutoSave({
    formType,
    formData,
    interval: autoSaveInterval,
    enabled: enableAutoSave
  })

  const { hasUnsavedChanges } = useUnsavedChanges({
    enabled: enableUnsavedWarning
  })

  // Save draft when component unmounts
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges && enableAutoSave) {
        saveNow()
      }
    }
  }, [hasUnsavedChanges, enableAutoSave, saveNow])

  const handleDraftRestore = (draftData: Record<string, any>) => {
    onDraftRestore?.(draftData)
  }

  const handleDraftDiscard = () => {
    onDraftDiscard?.()
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Draft Restoration */}
      {showDraftRestoration && onDraftRestore && (
        <DraftRestoration
          formType={formType}
          onRestore={handleDraftRestore}
          onDiscard={handleDraftDiscard}
        />
      )}

      {/* Auto-save Indicator */}
      {showAutoSaveIndicator && (
        <div className="flex justify-between items-center">
          <div /> {/* Spacer */}
          <AutoSaveIndicator />
        </div>
      )}

      {/* Form Content */}
      {children}
    </div>
  )
}

// Higher-order component for wrapping forms with auto-save
export function withAutoSave<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  formType: 'gas_safety' | 'invoice' | 'service_checklist'
) {
  return function AutoSaveWrapper(props: P & {
    formData?: Record<string, any>
    onDraftRestore?: (draftData: Record<string, any>) => void
    onDraftDiscard?: () => void
  }) {
    const { formData = {}, onDraftRestore, onDraftDiscard, ...restProps } = props

    return (
      <AutoSaveForm
        formType={formType}
        formData={formData}
        onDraftRestore={onDraftRestore}
        onDraftDiscard={onDraftDiscard}
      >
        <WrappedComponent {...(restProps as P)} />
      </AutoSaveForm>
    )
  }
}