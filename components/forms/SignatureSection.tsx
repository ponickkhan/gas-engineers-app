'use client'

import React from 'react'
import { SignatureUpload } from '@/components/ui/SignatureUpload'
import { SignatureField } from '@/components/ui/SignatureDisplay'
import { FormField } from '@/components/ui/FormField'

interface SignatureSectionProps {
  title: string
  signatureUrl?: string | null
  onSignatureChange: (url: string | null) => void
  name?: string
  onNameChange?: (name: string) => void
  nameLabel?: string
  position?: string
  onPositionChange?: (position: string) => void
  positionLabel?: string
  licence?: string
  onLicenceChange?: (licence: string) => void
  licenceLabel?: string
  disabled?: boolean
  printMode?: boolean
  className?: string
}

export function SignatureSection({
  title,
  signatureUrl,
  onSignatureChange,
  name,
  onNameChange,
  nameLabel = "Name",
  position,
  onPositionChange,
  positionLabel = "Position",
  licence,
  onLicenceChange,
  licenceLabel = "Licence Number",
  disabled = false,
  printMode = false,
  className = ""
}: SignatureSectionProps) {
  if (printMode) {
    return (
      <div className={`print-signature-field ${className}`}>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        
        <SignatureField
          signatureUrl={signatureUrl}
          name={name}
          title={position}
          printMode={true}
        />
        
        {licence && (
          <div className="mt-2 text-sm">
            <strong>{licenceLabel}:</strong> {licence}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold">{title}</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <SignatureUpload
            value={signatureUrl || undefined}
            onChange={onSignatureChange}
            label="Signature"
            disabled={disabled}
          />
        </div>
        
        <div className="space-y-4">
          {onNameChange && (
            <FormField
              label={nameLabel}
              type="text"
              value={name || ''}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={disabled}
            />
          )}
          
          {onPositionChange && (
            <FormField
              label={positionLabel}
              type="text"
              value={position || ''}
              onChange={(e) => onPositionChange(e.target.value)}
              disabled={disabled}
            />
          )}
          
          {onLicenceChange && (
            <FormField
              label={licenceLabel}
              type="text"
              value={licence || ''}
              onChange={(e) => onLicenceChange(e.target.value)}
              disabled={disabled}
            />
          )}
        </div>
      </div>
      
      {signatureUrl && (
        <div className="mt-4">
          <SignatureField
            signatureUrl={signatureUrl}
            name={name}
            title={position}
            label="Preview"
          />
        </div>
      )}
    </div>
  )
}

interface DualSignatureSectionProps {
  engineerTitle?: string
  engineerSignatureUrl?: string | null
  onEngineerSignatureChange: (url: string | null) => void
  engineerName?: string
  onEngineerNameChange?: (name: string) => void
  engineerLicence?: string
  onEngineerLicenceChange?: (licence: string) => void
  
  clientTitle?: string
  clientSignatureUrl?: string | null
  onClientSignatureChange: (url: string | null) => void
  clientName?: string
  onClientNameChange?: (name: string) => void
  clientPosition?: string
  onClientPositionChange?: (position: string) => void
  
  disabled?: boolean
  printMode?: boolean
  className?: string
}

export function DualSignatureSection({
  engineerTitle = "Engineer Signature",
  engineerSignatureUrl,
  onEngineerSignatureChange,
  engineerName,
  onEngineerNameChange,
  engineerLicence,
  onEngineerLicenceChange,
  
  clientTitle = "Client Signature",
  clientSignatureUrl,
  onClientSignatureChange,
  clientName,
  onClientNameChange,
  clientPosition,
  onClientPositionChange,
  
  disabled = false,
  printMode = false,
  className = ""
}: DualSignatureSectionProps) {
  if (printMode) {
    return (
      <div className={`print-signatures ${className}`}>
        <SignatureSection
          title={engineerTitle}
          signatureUrl={engineerSignatureUrl}
          onSignatureChange={onEngineerSignatureChange}
          name={engineerName}
          licence={engineerLicence}
          licenceLabel="Gas Safe Licence"
          printMode={true}
        />
        
        <SignatureSection
          title={clientTitle}
          signatureUrl={clientSignatureUrl}
          onSignatureChange={onClientSignatureChange}
          name={clientName}
          position={clientPosition}
          printMode={true}
        />
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SignatureSection
          title={engineerTitle}
          signatureUrl={engineerSignatureUrl}
          onSignatureChange={onEngineerSignatureChange}
          name={engineerName}
          onNameChange={onEngineerNameChange}
          licence={engineerLicence}
          onLicenceChange={onEngineerLicenceChange}
          licenceLabel="Gas Safe Licence"
          disabled={disabled}
        />
        
        <SignatureSection
          title={clientTitle}
          signatureUrl={clientSignatureUrl}
          onSignatureChange={onClientSignatureChange}
          name={clientName}
          onNameChange={onClientNameChange}
          position={clientPosition}
          onPositionChange={onClientPositionChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}