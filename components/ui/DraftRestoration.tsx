'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from '@/contexts/FormContext'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { cn } from '@/utils/cn'

interface DraftRestorationProps {
  formType: 'gas_safety' | 'invoice' | 'service_checklist'
  onRestore: (draftData: Record<string, any>) => void
  onDiscard: () => void
  className?: string
}

export function DraftRestoration({
  formType,
  onRestore,
  onDiscard,
  className
}: DraftRestorationProps) {
  const [draftData, setDraftData] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPrompt, setShowPrompt] = useState(false)
  
  const { loadDraft, deleteDraft } = useForm()

  useEffect(() => {
    const checkForDraft = async () => {
      setLoading(true)
      try {
        const draft = await loadDraft(formType)
        if (draft) {
          setDraftData(draft)
          setShowPrompt(true)
        }
      } catch (error) {
        console.error('Error checking for draft:', error)
      } finally {
        setLoading(false)
      }
    }

    checkForDraft()
  }, [formType, loadDraft])

  const handleRestore = async () => {
    if (draftData) {
      onRestore(draftData)
      setShowPrompt(false)
    }
  }

  const handleDiscard = async () => {
    try {
      await deleteDraft(formType)
      onDiscard()
      setShowPrompt(false)
    } catch (error) {
      console.error('Error discarding draft:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  if (loading || !showPrompt || !draftData) {
    return null
  }

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'gas_safety': return 'Gas Safety Record'
      case 'invoice': return 'Invoice'
      case 'service_checklist': return 'Service Checklist'
      default: return 'Form'
    }
  }

  const getDraftAge = () => {
    if (!draftData) return ''
    
    // Assuming the draft data has a timestamp or we can get it from the context
    // For now, we'll show a generic message
    return 'from your previous session'
  }

  return (
    <Card className={cn('border-blue-200 bg-blue-50', className)}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">💾</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-blue-900">
              Draft Found
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              We found a saved draft of your {getFormTypeLabel(formType).toLowerCase()} {getDraftAge()}. 
              Would you like to restore it and continue where you left off?
            </p>
            <div className="flex space-x-3 mt-3">
              <Button
                size="sm"
                onClick={handleRestore}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Restore Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDiscard}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Discard Draft
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-blue-600 hover:bg-blue-100"
              >
                Continue Without Draft
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-400 hover:text-blue-600"
          >
            <span className="sr-only">Dismiss</span>
            ✕
          </button>
        </div>
      </CardContent>
    </Card>
  )
}