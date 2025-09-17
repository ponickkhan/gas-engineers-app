'use client'

import { useState, useCallback, useRef } from 'react'
import { useToast } from '@/components/ui/Toast'
import { parseError, getUserFriendlyMessage } from '@/utils/errorHandling'

export interface OptimisticUpdate<T> {
  id: string
  type: 'create' | 'update' | 'delete'
  data: T
  originalData?: T
  timestamp: number
}

export interface OptimisticOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  rollbackOnError?: boolean
  onSuccess?: () => void
  onError?: (error: any) => void
}

/**
 * Hook for managing optimistic updates with automatic rollback on failure
 */
export function useOptimisticUpdates<T extends { id?: string }>(
  initialData: T[] = [],
  options: OptimisticOptions = {}
) {
  const [data, setData] = useState<T[]>(initialData)
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>([])
  const { addToast } = useToast()
  const updateIdCounter = useRef(0)

  const {
    showSuccessToast = true,
    showErrorToast = true,
    rollbackOnError = true,
    onSuccess,
    onError
  } = options

  // Generate unique update ID
  const generateUpdateId = useCallback(() => {
    return `update_${Date.now()}_${++updateIdCounter.current}`
  }, [])

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
    setPendingUpdates(prev => [...prev, update])
    
    setData(prev => {
      switch (update.type) {
        case 'create':
          return [...prev, update.data]
        
        case 'update':
          return prev.map(item => 
            item.id === update.data.id ? update.data : item
          )
        
        case 'delete':
          return prev.filter(item => item.id !== update.data.id)
        
        default:
          return prev
      }
    })
  }, [])

  // Rollback optimistic update
  const rollbackUpdate = useCallback((updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId)
    if (!update) return

    setPendingUpdates(prev => prev.filter(u => u.id !== updateId))
    
    setData(prev => {
      switch (update.type) {
        case 'create':
          return prev.filter(item => item.id !== update.data.id)
        
        case 'update':
          if (update.originalData) {
            return prev.map(item => 
              item.id === update.data.id ? update.originalData! : item
            )
          }
          return prev
        
        case 'delete':
          if (update.originalData) {
            return [...prev, update.originalData]
          }
          return prev
        
        default:
          return prev
      }
    })
  }, [pendingUpdates])

  // Confirm optimistic update (remove from pending)
  const confirmUpdate = useCallback((updateId: string) => {
    setPendingUpdates(prev => prev.filter(u => u.id !== updateId))
  }, [])

  // Optimistic create
  const optimisticCreate = useCallback(async (
    item: T,
    serverAction: (item: T) => Promise<T>
  ) => {
    const updateId = generateUpdateId()
    const optimisticItem = { ...item, id: item.id || `temp_${updateId}` }
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'create',
      data: optimisticItem,
      timestamp: Date.now()
    }

    // Apply optimistic update immediately
    applyOptimisticUpdate(update)

    try {
      // Perform server action
      const serverResult = await serverAction(item)
      
      // Update with server result
      setData(prev => prev.map(i => 
        i.id === optimisticItem.id ? serverResult : i
      ))
      
      confirmUpdate(updateId)
      
      if (showSuccessToast) {
        addToast({
          type: 'success',
          title: 'Created',
          message: 'Item created successfully'
        })
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      return serverResult
    } catch (error) {
      if (rollbackOnError) {
        rollbackUpdate(updateId)
      }
      
      if (showErrorToast) {
        const appError = parseError(error)
        addToast({
          type: 'error',
          title: 'Creation Failed',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      if (onError) {
        onError(error)
      }
      
      throw error
    }
  }, [
    generateUpdateId,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    rollbackOnError,
    showSuccessToast,
    showErrorToast,
    addToast,
    onSuccess,
    onError
  ])

  // Optimistic update
  const optimisticUpdate = useCallback(async (
    item: T,
    serverAction: (item: T) => Promise<T>
  ) => {
    const updateId = generateUpdateId()
    const originalItem = data.find(i => i.id === item.id)
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'update',
      data: item,
      originalData: originalItem,
      timestamp: Date.now()
    }

    // Apply optimistic update immediately
    applyOptimisticUpdate(update)

    try {
      // Perform server action
      const serverResult = await serverAction(item)
      
      // Update with server result
      setData(prev => prev.map(i => 
        i.id === item.id ? serverResult : i
      ))
      
      confirmUpdate(updateId)
      
      if (showSuccessToast) {
        addToast({
          type: 'success',
          title: 'Updated',
          message: 'Item updated successfully'
        })
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      return serverResult
    } catch (error) {
      if (rollbackOnError) {
        rollbackUpdate(updateId)
      }
      
      if (showErrorToast) {
        const appError = parseError(error)
        addToast({
          type: 'error',
          title: 'Update Failed',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      if (onError) {
        onError(error)
      }
      
      throw error
    }
  }, [
    generateUpdateId,
    data,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    rollbackOnError,
    showSuccessToast,
    showErrorToast,
    addToast,
    onSuccess,
    onError
  ])

  // Optimistic delete
  const optimisticDelete = useCallback(async (
    itemId: string,
    serverAction: (id: string) => Promise<void>
  ) => {
    const updateId = generateUpdateId()
    const originalItem = data.find(i => i.id === itemId)
    
    if (!originalItem) {
      throw new Error('Item not found')
    }
    
    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'delete',
      data: originalItem,
      originalData: originalItem,
      timestamp: Date.now()
    }

    // Apply optimistic update immediately
    applyOptimisticUpdate(update)

    try {
      // Perform server action
      await serverAction(itemId)
      
      confirmUpdate(updateId)
      
      if (showSuccessToast) {
        addToast({
          type: 'success',
          title: 'Deleted',
          message: 'Item deleted successfully'
        })
      }
      
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (rollbackOnError) {
        rollbackUpdate(updateId)
      }
      
      if (showErrorToast) {
        const appError = parseError(error)
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      if (onError) {
        onError(error)
      }
      
      throw error
    }
  }, [
    generateUpdateId,
    data,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    rollbackOnError,
    showSuccessToast,
    showErrorToast,
    addToast,
    onSuccess,
    onError
  ])

  // Batch optimistic updates
  const optimisticBatch = useCallback(async (
    operations: Array<{
      type: 'create' | 'update' | 'delete'
      item: T
      serverAction: (item: T) => Promise<T | void>
    }>
  ) => {
    const updateIds: string[] = []
    
    try {
      // Apply all optimistic updates
      for (const operation of operations) {
        const updateId = generateUpdateId()
        updateIds.push(updateId)
        
        const update: OptimisticUpdate<T> = {
          id: updateId,
          type: operation.type,
          data: operation.item,
          originalData: operation.type !== 'create' ? 
            data.find(i => i.id === operation.item.id) : undefined,
          timestamp: Date.now()
        }
        
        applyOptimisticUpdate(update)
      }
      
      // Execute all server actions
      const results = await Promise.all(
        operations.map(op => op.serverAction(op.item))
      )
      
      // Confirm all updates
      updateIds.forEach(confirmUpdate)
      
      if (showSuccessToast) {
        addToast({
          type: 'success',
          title: 'Batch Update',
          message: `${operations.length} items updated successfully`
        })
      }
      
      if (onSuccess) {
        onSuccess()
      }
      
      return results
    } catch (error) {
      if (rollbackOnError) {
        updateIds.forEach(rollbackUpdate)
      }
      
      if (showErrorToast) {
        const appError = parseError(error)
        addToast({
          type: 'error',
          title: 'Batch Update Failed',
          message: getUserFriendlyMessage(appError)
        })
      }
      
      if (onError) {
        onError(error)
      }
      
      throw error
    }
  }, [
    generateUpdateId,
    data,
    applyOptimisticUpdate,
    confirmUpdate,
    rollbackUpdate,
    rollbackOnError,
    showSuccessToast,
    showErrorToast,
    addToast,
    onSuccess,
    onError
  ])

  // Reset data
  const resetData = useCallback((newData: T[]) => {
    setData(newData)
    setPendingUpdates([])
  }, [])

  return {
    data,
    pendingUpdates,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    optimisticBatch,
    resetData,
    hasPendingUpdates: pendingUpdates.length > 0
  }
}