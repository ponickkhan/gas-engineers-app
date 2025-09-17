'use client'

import React, { useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

interface PrintPreviewProps {
  children: React.ReactNode
  title: string
  onPrint?: () => void
  className?: string
}

export function PrintPreview({ 
  children, 
  title, 
  onPrint,
  className = '' 
}: PrintPreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
    setShowPreview(false)
  }

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowPreview(true)}
        className={className}
      >
        Print Preview
      </Button>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={`Print Preview - ${title}`}
        size="xl"
      >
        <div className="space-y-4">
          {/* Preview content with print styles applied */}
          <div 
            className="bg-white border border-gray-200 p-6 max-h-96 overflow-y-auto"
            style={{ 
              fontFamily: 'Arial, sans-serif',
              fontSize: '12px',
              lineHeight: '1.4'
            }}
          >
            {children}
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Print
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// Component for print-optimized content
interface PrintContentProps {
  children: React.ReactNode
  className?: string
}

export function PrintContent({ children, className = '' }: PrintContentProps) {
  return (
    <div className={`print-content ${className}`}>
      {children}
      
      <style jsx>{`
        .print-content {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: black;
          background: white;
        }
        
        .print-content .header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .print-content .header h1 {
          font-size: 18px;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .print-content .header h2 {
          font-size: 14px;
          margin-bottom: 5px;
          color: #666;
        }
        
        .print-content .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .print-content .section h3 {
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: bold;
        }
        
        .print-content .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .print-content .field {
          margin-bottom: 8px;
        }
        
        .print-content .field-label {
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .print-content .field-value {
          margin-left: 10px;
        }
        
        .print-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .print-content th,
        .print-content td {
          border: 1px solid #333;
          padding: 6px;
          text-align: left;
          font-size: 11px;
        }
        
        .print-content th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .print-content .signature-box {
          border: 1px solid #333;
          height: 60px;
          margin-top: 10px;
        }
      `}</style>
    </div>
  )
}