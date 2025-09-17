'use client'

import React, { useState } from 'react'
import { Button } from './Button'
import { PrintPreview } from './PrintPreview'

interface PrintButtonProps {
  printContentId: string
  title: string
  onPrint?: () => void
  showPreview?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
}

export function PrintButton({ 
  printContentId,
  title,
  onPrint,
  showPreview = true,
  className = '',
  variant = 'outline'
}: PrintButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleDirectPrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      // Default print functionality
      const printContent = document.getElementById(printContentId)
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${title}</title>
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    margin: 20px; 
                    font-size: 12px;
                    line-height: 1.4;
                    color: black;
                    background: white;
                  }
                  .header { 
                    text-align: center; 
                    margin-bottom: 30px; 
                  }
                  .section { 
                    margin-bottom: 20px; 
                    page-break-inside: avoid; 
                  }
                  .section h3 { 
                    border-bottom: 1px solid #333; 
                    padding-bottom: 5px; 
                    margin-bottom: 10px;
                    font-size: 14px;
                    font-weight: bold;
                  }
                  .grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 20px; 
                  }
                  .field { 
                    margin-bottom: 8px; 
                  }
                  .field-label { 
                    font-weight: bold; 
                    margin-bottom: 2px; 
                  }
                  .field-value { 
                    margin-left: 10px; 
                  }
                  table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px; 
                  }
                  th, td { 
                    border: 1px solid #333; 
                    padding: 6px; 
                    text-align: left; 
                    font-size: 11px; 
                  }
                  th { 
                    background-color: #f0f0f0; 
                    font-weight: bold; 
                  }
                  .signature-box { 
                    border: 1px solid #333; 
                    height: 60px; 
                    margin-top: 10px; 
                  }
                  .check-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                  }
                  .check-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 5px;
                    border: 1px solid #ddd;
                    font-size: 10px;
                  }
                  .totals table {
                    width: 300px;
                    margin-left: auto;
                  }
                  .grand-total {
                    font-weight: bold;
                    font-size: 1.1em;
                  }
                  @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                  }
                </style>
              </head>
              <body>
                ${printContent.innerHTML}
              </body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()
          printWindow.close()
        }
      }
    }
    setShowDropdown(false)
  }

  const handlePreview = () => {
    // This would open a print preview modal
    // For now, we'll just call the direct print
    handleDirectPrint()
    setShowDropdown(false)
  }

  if (!showPreview) {
    return (
      <Button 
        variant={variant}
        onClick={handleDirectPrint}
        className={className}
      >
        Print
      </Button>
    )
  }

  return (
    <div className="relative">
      <div className="flex">
        <Button 
          variant={variant}
          onClick={handleDirectPrint}
          className={`${className} rounded-r-none border-r-0`}
        >
          Print
        </Button>
        <Button
          variant={variant}
          onClick={() => setShowDropdown(!showDropdown)}
          className="rounded-l-none px-2"
        >
          ▼
        </Button>
      </div>
      
      {showDropdown && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <div className="py-1">
            <button
              onClick={handleDirectPrint}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Print Now
            </button>
            <button
              onClick={handlePreview}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              Print Preview
            </button>
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}