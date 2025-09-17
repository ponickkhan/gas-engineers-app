'use client'

import React from 'react'

interface SignatureDisplayProps {
  signatureUrl?: string | null
  name?: string
  title?: string
  date?: string
  label?: string
  className?: string
  showBorder?: boolean
  height?: string
}

export function SignatureDisplay({
  signatureUrl,
  name,
  title,
  date,
  label,
  className = '',
  showBorder = true,
  height = 'h-24'
}: SignatureDisplayProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="text-sm font-medium text-gray-700">
          {label}
        </div>
      )}
      
      <div className={`
        ${height} flex items-end justify-center p-2 bg-gray-50
        ${showBorder ? 'border border-gray-300 rounded' : ''}
      `}>
        {signatureUrl ? (
          <img
            src={signatureUrl}
            alt={`${name || 'Signature'}`}
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-gray-400 text-sm text-center">
            No signature provided
          </div>
        )}
      </div>
      
      <div className="space-y-1 text-sm">
        {name && (
          <div>
            <span className="font-medium">Name:</span> {name}
          </div>
        )}
        {title && (
          <div>
            <span className="font-medium">Position:</span> {title}
          </div>
        )}
        {date && (
          <div>
            <span className="font-medium">Date:</span> {date}
          </div>
        )}
      </div>
    </div>
  )
}

interface SignatureFieldProps {
  signatureUrl?: string | null
  name?: string
  title?: string
  label?: string
  className?: string
  printMode?: boolean
}

export function SignatureField({
  signatureUrl,
  name,
  title,
  label,
  className = '',
  printMode = false
}: SignatureFieldProps) {
  if (printMode) {
    return (
      <div className={`print-signature-field ${className}`}>
        {label && (
          <div className="text-sm font-medium mb-2">{label}</div>
        )}
        
        <div className="border-b-2 border-black h-16 flex items-end justify-center mb-2">
          {signatureUrl && (
            <img
              src={signatureUrl}
              alt={`${name || 'Signature'}`}
              className="max-h-full max-w-full object-contain"
            />
          )}
        </div>
        
        <div className="text-sm space-y-1">
          {name && (
            <div className="border-b border-gray-400 pb-1">
              <strong>Name:</strong> {name}
            </div>
          )}
          {title && (
            <div className="border-b border-gray-400 pb-1">
              <strong>Position:</strong> {title}
            </div>
          )}
          <div className="border-b border-gray-400 pb-1">
            <strong>Date:</strong> _______________
          </div>
        </div>
      </div>
    )
  }

  return (
    <SignatureDisplay
      signatureUrl={signatureUrl}
      name={name}
      title={title}
      label={label}
      className={className}
      showBorder={true}
      height="h-20"
    />
  )
}