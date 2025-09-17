'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { SignatureUpload } from '@/components/ui/SignatureUpload'
import { SignatureDisplay } from '@/components/ui/SignatureDisplay'
import { DualSignatureSection } from '@/components/forms/SignatureSection'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

function SignatureDemoContent() {
  const [engineerSignature, setEngineerSignature] = useState<string | undefined>(undefined)
  const [clientSignature, setClientSignature] = useState<string | undefined>(undefined)
  const [engineerName, setEngineerName] = useState('John Smith')
  const [engineerLicence, setEngineerLicence] = useState('123456')
  const [clientName, setClientName] = useState('Jane Doe')
  const [clientPosition, setClientPosition] = useState('Property Manager')

  const handleEngineerSignatureChange = (url: string | null) => {
    setEngineerSignature(url || undefined)
  }

  const handleClientSignatureChange = (url: string | null) => {
    setClientSignature(url || undefined)
  }

  return (
    <DashboardLayout title="Signature Upload Demo">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Individual Signature Upload Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Signature Upload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SignatureUpload
                  value={engineerSignature}
                  onChange={handleEngineerSignatureChange}
                  label="Engineer Signature"
                />
              </div>
              <div>
                <SignatureUpload
                  value={clientSignature}
                  onChange={handleClientSignatureChange}
                  label="Client Signature"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Display Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Signature Display</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignatureDisplay
                signatureUrl={engineerSignature}
                name={engineerName}
                title="Gas Safe Engineer"
                date={new Date().toLocaleDateString()}
                label="Engineer Signature"
              />
              <SignatureDisplay
                signatureUrl={clientSignature}
                name={clientName}
                title={clientPosition}
                date={new Date().toLocaleDateString()}
                label="Client Signature"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dual Signature Section Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Dual Signature Section</CardTitle>
          </CardHeader>
          <CardContent>
            <DualSignatureSection
              engineerSignatureUrl={engineerSignature}
              onEngineerSignatureChange={handleEngineerSignatureChange}
              engineerName={engineerName}
              onEngineerNameChange={setEngineerName}
              engineerLicence={engineerLicence}
              onEngineerLicenceChange={setEngineerLicence}
              
              clientSignatureUrl={clientSignature}
              onClientSignatureChange={handleClientSignatureChange}
              clientName={clientName}
              onClientNameChange={setClientName}
              clientPosition={clientPosition}
              onClientPositionChange={setClientPosition}
            />
          </CardContent>
        </Card>

        {/* Print Preview Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Print Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="print-signatures">
              <DualSignatureSection
                engineerSignatureUrl={engineerSignature}
                onEngineerSignatureChange={handleEngineerSignatureChange}
                engineerName={engineerName}
                engineerLicence={engineerLicence}
                
                clientSignatureUrl={clientSignature}
                onClientSignatureChange={handleClientSignatureChange}
                clientName={clientName}
                clientPosition={clientPosition}
                
                printMode={true}
              />
            </div>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}

export default function SignatureDemoPage() {
  return (
    <AuthGuard>
      <SignatureDemoContent />
    </AuthGuard>
  )
}