'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 5000
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="toast-container fixed top-4 right-4 left-4 sm:left-auto z-50 space-y-3 w-auto sm:w-full sm:max-w-md md:max-w-lg lg:max-w-md">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const variants = {
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: '✅',
      iconBg: 'bg-green-100',
      text: 'text-green-800'
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: '❌',
      iconBg: 'bg-red-100',
      text: 'text-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      text: 'text-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      text: 'text-blue-800'
    }
  }

  const variant = variants[toast.type]

  return (
    <div className={cn(
      'w-full shadow-lg rounded-lg pointer-events-auto border transform transition-all duration-300 ease-in-out',
      'animate-in slide-in-from-right-full',
      variant.bg
    )}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-base',
            variant.iconBg
          )}>
            {variant.icon}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className={cn('text-sm font-semibold leading-5', variant.text)}>
              {toast.title}
            </p>
            {toast.message && (
              <p className={cn('mt-1 text-sm leading-5 break-words', variant.text)}>
                {toast.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => onRemove(toast.id)}
              className={cn(
                'rounded-md inline-flex items-center justify-center w-6 h-6 text-sm hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                variant.text
              )}
            >
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Convenience hooks for different toast types
export function useSuccessToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message })
  }, [addToast])
}

export function useErrorToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message })
  }, [addToast])
}

export function useWarningToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message })
  }, [addToast])
}

export function useInfoToast() {
  const { addToast } = useToast()
  return useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message })
  }, [addToast])
}