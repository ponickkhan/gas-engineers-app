'use client'

import React from 'react'
import { ServiceChecklist } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/components/ui/DataTable'
import { useAuth } from '@/contexts/AuthContext'

interface ServiceChecklistViewProps {
  checklist: ServiceChecklist
  onEdit?: () => void
  onPrint?: () => void
  showActions?: boolean
}

export function ServiceChecklistView({ 
  checklist, 
  onEdit, 
  onPrint, 
  showActions = true 
}: ServiceChecklistViewProps) {
  const { profile } = useAuth()

  // Add print styles when component mounts
  React.useEffect(() => {
    const printStyles = `
      @media print {
        body * { visibility: hidden; }
        #service-checklist-print-content, #service-checklist-print-content * { visibility: visible; }
        #service-checklist-print-content { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .print\\:block { display: block !important; }
        .hidden { display: none; }
        .print\\:block.hidden { display: block !important; }
      }
    `
    
    const styleSheet = document.createElement('style')
    styleSheet.type = 'text/css'
    styleSheet.innerText = printStyles
    document.head.appendChild(styleSheet)
    
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  const getSafetyStatusVariant = (safeToUse?: string) => {
    switch (safeToUse?.toLowerCase()) {
      case 'yes': return 'success'
      case 'no': return 'error'
      default: return 'warning'
    }
  }

  const getGiuspVariant = (classification?: string) => {
    switch (classification) {
      case 'Satisfactory': return 'success'
      case 'Not to Current Standards': return 'warning'
      case 'At Risk': return 'warning'
      case 'Immediately Dangerous': return 'error'
      default: return 'default'
    }
  }

  const getCheckResultVariant = (result?: string) => {
    switch (result?.toLowerCase()) {
      case 'pass': return 'success'
      case 'fail': return 'error'
      case 'n/a': return 'default'
      default: return 'warning'
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      // Default print functionality
      const printContent = document.getElementById('service-checklist-print-content')
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Service & Maintenance Checklist</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .section { margin-bottom: 20px; page-break-inside: avoid; }
                  .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                  .field { margin-bottom: 8px; }
                  .field-label { font-weight: bold; margin-bottom: 2px; }
                  .field-value { margin-left: 10px; }
                  .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                  .check-item { display: flex; justify-content: space-between; padding: 5px; border: 1px solid #ddd; }
                  .signature-section { margin-top: 30px; }
                  .signature-box { border: 1px solid #ccc; height: 60px; margin-top: 10px; }
                  @media print {
                    body { margin: 0; }
                    .no-print { display: none; }
                    .page-break { page-break-before: always; }
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
  }

  const renderCheckResults = (checks: Record<string, any> | undefined, title: string) => {
    if (!checks || Object.keys(checks).length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">
          No {title.toLowerCase()} recorded
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(checks).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <span className="text-sm font-medium text-gray-700">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            {value && (
              <Badge variant={getCheckResultVariant(value)} size="sm">
                {value}
              </Badge>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderCheckResultsForPrint = (checks: Record<string, any> | undefined) => {
    if (!checks || Object.keys(checks).length === 0) {
      return <div>No checks recorded</div>
    }

    return (
      <div className="check-grid">
        {Object.entries(checks).map(([key, value]) => (
          <div key={key} className="check-item">
            <span>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            <span>{value || '-'}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Print-friendly content */}
      <div id="service-checklist-print-content" className="hidden print:block">
        <div className="header">
          <h1>SERVICE & MAINTENANCE CHECKLIST</h1>
          <h2>Gas Safety (Installation and Use) Regulations 1998</h2>
        </div>
        
        <div className="section">
          <h3>Service Information</h3>
          <div className="grid">
            <div>
              {checklist.completion_date && (
                <div className="field">
                  <div className="field-label">Completion Date:</div>
                  <div className="field-value">{formatDate(checklist.completion_date)}</div>
                </div>
              )}
            </div>
            <div>
              {checklist.next_service_date && (
                <div className="field">
                  <div className="field-label">Next Service Date:</div>
                  <div className="field-value">{formatDate(checklist.next_service_date)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Site Details</h3>
          {checklist.site_details ? (
            <div>
              {checklist.site_details.name && <div><strong>Name:</strong> {checklist.site_details.name}</div>}
              {checklist.site_details.address && <div><strong>Address:</strong> {checklist.site_details.address}</div>}
              {checklist.site_details.postcode && <div><strong>Postcode:</strong> {checklist.site_details.postcode}</div>}
              {checklist.site_details.contact_number && <div><strong>Tel:</strong> {checklist.site_details.contact_number}</div>}
              {checklist.site_details.email && <div><strong>Email:</strong> {checklist.site_details.email}</div>}
            </div>
          ) : (
            <div>No site details provided</div>
          )}
        </div>

        <div className="section">
          <h3>Appliance Details</h3>
          {checklist.appliance_details ? (
            <div className="grid">
              {checklist.appliance_details.type && (
                <div className="field">
                  <div className="field-label">Type:</div>
                  <div className="field-value">{checklist.appliance_details.type}</div>
                </div>
              )}
              {checklist.appliance_details.location && (
                <div className="field">
                  <div className="field-label">Location:</div>
                  <div className="field-value">{checklist.appliance_details.location}</div>
                </div>
              )}
              {checklist.appliance_details.manufacturer && (
                <div className="field">
                  <div className="field-label">Manufacturer:</div>
                  <div className="field-value">{checklist.appliance_details.manufacturer}</div>
                </div>
              )}
              {checklist.appliance_details.model && (
                <div className="field">
                  <div className="field-label">Model:</div>
                  <div className="field-value">{checklist.appliance_details.model}</div>
                </div>
              )}
              {checklist.appliance_details.serial_no && (
                <div className="field">
                  <div className="field-label">Serial Number:</div>
                  <div className="field-value">{checklist.appliance_details.serial_no}</div>
                </div>
              )}
            </div>
          ) : (
            <div>No appliance details provided</div>
          )}
        </div>

        <div className="section">
          <h3>Installation Checks</h3>
          {renderCheckResultsForPrint(checklist.installation_checks)}
        </div>

        <div className="section">
          <h3>Appliance Checks</h3>
          {renderCheckResultsForPrint(checklist.appliance_checks)}
        </div>

        <div className="section">
          <h3>Safety Summary</h3>
          <div className="grid">
            {checklist.safety_summary?.safe_to_use && (
              <div className="field">
                <div className="field-label">Safe to Use:</div>
                <div className="field-value">{checklist.safety_summary.safe_to_use}</div>
              </div>
            )}
            {checklist.safety_summary?.giusp_classification && (
              <div className="field">
                <div className="field-label">GIUSP Classification:</div>
                <div className="field-value">{checklist.safety_summary.giusp_classification}</div>
              </div>
            )}
          </div>
          {checklist.safety_summary?.warning_notice && (
            <div className="field">
              <div className="field-label">Warning Notice:</div>
              <div className="field-value">{checklist.safety_summary.warning_notice}</div>
            </div>
          )}
        </div>

        <div className="signature-section">
          <div className="grid">
            <div>
              <h3>Engineer Details</h3>
              {checklist.engineer_name && <div><strong>Name:</strong> {checklist.engineer_name}</div>}
              {checklist.engineer_licence && <div><strong>Gas Safe Licence:</strong> {checklist.engineer_licence}</div>}
              <div><strong>Signature:</strong></div>
              <div className="signature-box">
                {checklist.engineer_signature && (
                  <img
                    src={checklist.engineer_signature}
                    alt="Engineer signature"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
            <div>
              <h3>Client Acknowledgment</h3>
              {checklist.client_name && <div><strong>Name:</strong> {checklist.client_name}</div>}
              {checklist.client_position && <div><strong>Position:</strong> {checklist.client_position}</div>}
              <div><strong>Signature:</strong></div>
              <div className="signature-box">
                {checklist.client_signature && (
                  <img
                    src={checklist.client_signature}
                    alt="Client signature"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screen display content */}
      <div className="no-print">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Service & Maintenance Checklist</CardTitle>
              <div className="mt-2 flex items-center space-x-4">
                {checklist.completion_date && (
                  <span className="text-sm text-gray-500">
                    Completed: {formatDate(checklist.completion_date)}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Created: {formatDate(checklist.created_at)}
                </span>
              </div>
            </div>
            {showActions && (
              <div className="flex space-x-2">
                {onEdit && (
                  <Button variant="outline" onClick={onEdit}>
                    Edit
                  </Button>
                )}
                <Button variant="outline" onClick={handlePrint}>
                  Print
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Details */}
        <Card>
          <CardHeader>
            <CardTitle>Site Details</CardTitle>
          </CardHeader>
          <CardContent>
            {checklist.site_details ? (
              <div className="space-y-1">
                {checklist.site_details.name && (
                  <div className="font-medium">{checklist.site_details.name}</div>
                )}
                {checklist.site_details.address && (
                  <div className="text-sm text-gray-600">{checklist.site_details.address}</div>
                )}
                {checklist.site_details.postcode && (
                  <div className="text-sm text-gray-600">{checklist.site_details.postcode}</div>
                )}
                {checklist.site_details.contact_number && (
                  <div className="text-sm text-gray-600">Tel: {checklist.site_details.contact_number}</div>
                )}
                {checklist.site_details.email && (
                  <div className="text-sm text-gray-600">Email: {checklist.site_details.email}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No site details provided</div>
            )}
          </CardContent>
        </Card>

        {/* Appliance Details */}
        <Card>
          <CardHeader>
            <CardTitle>Appliance Details</CardTitle>
          </CardHeader>
          <CardContent>
            {checklist.appliance_details ? (
              <div className="space-y-2">
                {checklist.appliance_details.type && (
                  <div>
                    <span className="text-sm text-gray-500">Type:</span>
                    <div className="font-medium">{checklist.appliance_details.type}</div>
                  </div>
                )}
                {checklist.appliance_details.location && (
                  <div>
                    <span className="text-sm text-gray-500">Location:</span>
                    <div className="font-medium">{checklist.appliance_details.location}</div>
                  </div>
                )}
                {checklist.appliance_details.manufacturer && (
                  <div>
                    <span className="text-sm text-gray-500">Manufacturer:</span>
                    <div className="font-medium">{checklist.appliance_details.manufacturer}</div>
                  </div>
                )}
                {checklist.appliance_details.model && (
                  <div>
                    <span className="text-sm text-gray-500">Model:</span>
                    <div className="font-medium">{checklist.appliance_details.model}</div>
                  </div>
                )}
                {checklist.appliance_details.serial_no && (
                  <div>
                    <span className="text-sm text-gray-500">Serial Number:</span>
                    <div className="font-medium">{checklist.appliance_details.serial_no}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No appliance details provided</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Service Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.completion_date && (
              <div>
                <span className="text-sm text-gray-500">Completion Date:</span>
                <div className="font-medium">{formatDate(checklist.completion_date)}</div>
              </div>
            )}
            {checklist.next_service_date && (
              <div>
                <span className="text-sm text-gray-500">Next Service Date:</span>
                <div className="font-medium">{formatDate(checklist.next_service_date)}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Installation Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {renderCheckResults(checklist.installation_checks, 'Installation Checks')}
        </CardContent>
      </Card>

      {/* Appliance Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Appliance Checks</CardTitle>
        </CardHeader>
        <CardContent>
          {renderCheckResults(checklist.appliance_checks, 'Appliance Checks')}
        </CardContent>
      </Card>

      {/* Safety Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {checklist.safety_summary?.safe_to_use && (
                <div>
                  <span className="text-sm text-gray-500">Safe to Use:</span>
                  <div className="mt-1">
                    <Badge variant={getSafetyStatusVariant(checklist.safety_summary.safe_to_use)}>
                      {checklist.safety_summary.safe_to_use}
                    </Badge>
                  </div>
                </div>
              )}
              {checklist.safety_summary?.giusp_classification && (
                <div>
                  <span className="text-sm text-gray-500">GIUSP Classification:</span>
                  <div className="mt-1">
                    <Badge variant={getGiuspVariant(checklist.safety_summary.giusp_classification)}>
                      {checklist.safety_summary.giusp_classification}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
            {checklist.safety_summary?.warning_notice && (
              <div>
                <span className="text-sm text-gray-500">Warning Notice:</span>
                <div className="mt-1 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                  {checklist.safety_summary.warning_notice}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signatures */}
      <Card>
        <CardHeader>
          <CardTitle>Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Engineer Signature */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Engineer Details</h4>
              <div className="space-y-2">
                {checklist.engineer_name && (
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <div className="font-medium">{checklist.engineer_name}</div>
                  </div>
                )}
                {checklist.engineer_licence && (
                  <div>
                    <span className="text-sm text-gray-500">Gas Safe Licence:</span>
                    <div className="font-medium">{checklist.engineer_licence}</div>
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-500">Signature:</span>
                <div className="mt-2 border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                  {checklist.engineer_signature ? (
                    <img
                      src={checklist.engineer_signature}
                      alt="Engineer signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No signature provided</span>
                  )}
                </div>
              </div>
            </div>

            {/* Client Signature */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Client Acknowledgment</h4>
              <div className="space-y-2">
                {checklist.client_name && (
                  <div>
                    <span className="text-sm text-gray-500">Name:</span>
                    <div className="font-medium">{checklist.client_name}</div>
                  </div>
                )}
                {checklist.client_position && (
                  <div>
                    <span className="text-sm text-gray-500">Position:</span>
                    <div className="font-medium">{checklist.client_position}</div>
                  </div>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-500">Signature:</span>
                <div className="mt-2 border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                  {checklist.client_signature ? (
                    <img
                      src={checklist.client_signature}
                      alt="Client signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No signature provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}