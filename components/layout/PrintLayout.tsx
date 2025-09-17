'use client'

import { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PrintLayoutProps {
  children: ReactNode
  orientation?: 'portrait' | 'landscape'
  title?: string
  showPrintButton?: boolean
  className?: string
}

export function PrintLayout({ 
  children, 
  orientation = 'portrait',
  title,
  showPrintButton = true,
  className 
}: PrintLayoutProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={cn("min-h-screen bg-gray-50", className)}>
      {/* Print toolbar - hidden in print */}
      {showPrintButton && (
        <div className="no-print bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div>
              {title && <h1 className="text-lg font-medium text-gray-900">{title}</h1>}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orient-blue"
              >
                ← Back
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orient-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orient-blue"
              >
                🖨️ Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print content */}
      <div className={cn(
        "print-content",
        orientation === 'landscape' ? 'print-landscape' : 'print-portrait'
      )}>
        <div className="max-w-none mx-auto bg-white print:bg-white print:shadow-none">
          {children}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-landscape {
            @page {
              size: A4 landscape;
              margin: 8mm;
            }
          }
          
          .print-portrait {
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-content {
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
          
          /* Hide form controls in print */
          input[type="date"]::-webkit-calendar-picker-indicator,
          input[type="date"]::-webkit-inner-spin-button,
          input[type="date"]::-webkit-clear-button,
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button {
            display: none !important;
            -webkit-appearance: none;
          }
          
          input[type="date"], 
          input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
          }
          
          select::-ms-expand {
            display: none;
          }
          
          select {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background: white !important;
            border: none !important;
          }
          
          /* Ensure text is visible in print */
          input, textarea, select {
            color: black !important;
            background: white !important;
            border: 1px solid #ccc !important;
          }
          
          /* Page breaks */
          .page-break-before {
            page-break-before: always;
          }
          
          .page-break-after {
            page-break-after: always;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  )
}

// Utility component for print-specific styling
interface PrintSectionProps {
  children: ReactNode
  title?: string
  className?: string
  avoidPageBreak?: boolean
}

export function PrintSection({ 
  children, 
  title, 
  className,
  avoidPageBreak = false 
}: PrintSectionProps) {
  return (
    <div className={cn(
      "mb-6",
      avoidPageBreak && "page-break-inside-avoid",
      className
    )}>
      {title && (
        <h2 className="text-lg font-semibold text-gray-900 mb-4 print:text-base">
          {title}
        </h2>
      )}
      {children}
    </div>
  )
}

// Component for print-optimized tables
interface PrintTableProps {
  children: ReactNode
  className?: string
}

export function PrintTable({ children, className }: PrintTableProps) {
  return (
    <div className={cn(
      "orient-block page-break-inside-avoid",
      className
    )}>
      <table className="orient-table w-full">
        {children}
      </table>
    </div>
  )
}