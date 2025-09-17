'use client'

import dynamic from 'next/dynamic'
import { LoadingSpinner, LoadingCard } from '@/components/ui/LoadingStates'

// Dynamic imports for heavy components with loading states

// Form components (heavy due to validation and complex UI)
export const DynamicGasSafetyForm = dynamic(
  () => import('@/components/gas-safety/GasSafetyForm').then(mod => ({ default: mod.GasSafetyForm })),
  {
    loading: () => (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    ),
    ssr: false
  }
)

export const DynamicServiceChecklistForm = dynamic(
  () => import('@/components/service-checklist/ServiceChecklistForm').then(mod => ({ default: mod.ServiceChecklistForm })),
  {
    loading: () => (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    ),
    ssr: false
  }
)

export const DynamicInvoiceForm = dynamic(
  () => import('@/components/invoices/InvoiceForm').then(mod => ({ default: mod.InvoiceForm })),
  {
    loading: () => (
      <div className="space-y-6">
        <LoadingCard />
        <LoadingCard />
      </div>
    ),
    ssr: false
  }
)

// View components (can be heavy with complex layouts)
export const DynamicGasSafetyView = dynamic(
  () => import('@/components/gas-safety/GasSafetyView').then(mod => ({ default: mod.GasSafetyView })),
  {
    loading: () => <LoadingCard />,
    ssr: true
  }
)

export const DynamicServiceChecklistView = dynamic(
  () => import('@/components/service-checklist/ServiceChecklistView').then(mod => ({ default: mod.ServiceChecklistView })),
  {
    loading: () => <LoadingCard />,
    ssr: true
  }
)

export const DynamicInvoiceView = dynamic(
  () => import('@/components/invoices/InvoiceView').then(mod => ({ default: mod.InvoiceView })),
  {
    loading: () => <LoadingCard />,
    ssr: true
  }
)

// Signature components (heavy due to image processing)
export const DynamicSignatureUpload = dynamic(
  () => import('@/components/ui/SignatureUpload').then(mod => ({ default: mod.SignatureUpload })),
  {
    loading: () => (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-2 text-sm text-gray-500">Loading signature upload...</p>
      </div>
    ),
    ssr: false
  }
)

export const DynamicSignatureDemo = dynamic(
  () => import('@/app/signature-demo/page'),
  {
    loading: () => (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-lg text-gray-600">Loading signature demo...</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

// Print components (only needed when printing)
export const DynamicPrintPreview = dynamic(
  () => import('@/components/ui/PrintPreview').then(mod => ({ default: mod.PrintPreview })),
  {
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    ),
    ssr: false
  }
)

// Chart/Analytics components (if we add them later)
export const DynamicChart = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Chart),
  {
    loading: () => (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    ),
    ssr: false
  }
)

// Modal components (only loaded when needed)
export const DynamicModal = dynamic(
  () => import('@/components/ui/Modal').then(mod => ({ default: mod.Modal })),
  {
    loading: () => null, // No loading state for modals
    ssr: false
  }
)

// File upload components
export const DynamicFileUpload = dynamic(
  () => import('@/components/ui/FileUpload').then(mod => ({ default: mod.FileUpload })),
  {
    loading: () => (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-sm text-gray-500">Loading file upload...</p>
      </div>
    ),
    ssr: false
  }
)

// Advanced form components
export const DynamicRichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then(mod => ({ default: mod.RichTextEditor })),
  {
    loading: () => (
      <div className="border border-gray-300 rounded-md h-32 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    ),
    ssr: false
  }
)

// Date picker (heavy due to calendar logic)
export const DynamicDatePicker = dynamic(
  () => import('@/components/ui/DatePicker').then(mod => ({ default: mod.DatePicker })),
  {
    loading: () => (
      <div className="w-full h-10 bg-gray-100 rounded-md animate-pulse" />
    ),
    ssr: false
  }
)