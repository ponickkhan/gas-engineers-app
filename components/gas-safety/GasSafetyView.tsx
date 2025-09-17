'use client'

import React from 'react'
import { GasSafetyRecord } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/components/ui/DataTable'
import { useAuth } from '@/contexts/AuthContext'

interface GasSafetyViewProps {
  record: GasSafetyRecord
  onEdit?: () => void
  onPrint?: () => void
  showActions?: boolean
}

export function GasSafetyView({ 
  record, 
  onEdit, 
  onPrint, 
  showActions = true 
}: GasSafetyViewProps) {
  const { profile } = useAuth()

  // Add print styles when component mounts
  React.useEffect(() => {
    const printStyles = `
      @media print {
        body * { visibility: hidden; }
        #gas-safety-print-content, #gas-safety-print-content * { visibility: visible; }
        #gas-safety-print-content { position: absolute; left: 0; top: 0; width: 100%; }
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

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      // Default print functionality
      const printContent = document.getElementById('gas-safety-print-content')
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Gas Safety Record ${record.reference_number || record.id}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .section { margin-bottom: 20px; page-break-inside: avoid; }
                  .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
                  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                  .field { margin-bottom: 8px; }
                  .field-label { font-weight: bold; margin-bottom: 2px; }
                  .field-value { margin-left: 10px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
                  th { background-color: #f5f5f5; font-weight: bold; }
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

  const formatContactDetails = (details: any) => {
    if (!details) return 'No details provided'
    
    return (
      <div>
        {details.name && <div><strong>Name:</strong> {details.name}</div>}
        {details.address && <div><strong>Address:</strong> {details.address}</div>}
        {details.postcode && <div><strong>Postcode:</strong> {details.postcode}</div>}
        {details.contact_number && <div><strong>Tel:</strong> {details.contact_number}</div>}
        {details.email && <div><strong>Email:</strong> {details.email}</div>}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Print-friendly content */}
      <div id="gas-safety-print-content" className="hidden print:block">
        <div className="header">
          <h1>GAS SAFETY RECORD</h1>
          <h2>Gas Safety (Installation and Use) Regulations 1998</h2>
          {record.reference_number && <h3>Reference: {record.reference_number}</h3>}
        </div>
        
        <div className="section">
          <h3>Record Details</h3>
          <div className="grid">
            <div>
              <div className="field">
                <div className="field-label">Record Date:</div>
                <div className="field-value">{formatDate(record.record_date)}</div>
              </div>
              {record.reference_number && (
                <div className="field">
                  <div className="field-label">Reference Number:</div>
                  <div className="field-value">{record.reference_number}</div>
                </div>
              )}
              {record.serial_number && (
                <div className="field">
                  <div className="field-label">Serial Number:</div>
                  <div className="field-value">{record.serial_number}</div>
                </div>
              )}
            </div>
            <div>
              {record.next_inspection_date && (
                <div className="field">
                  <div className="field-label">Next Inspection Date:</div>
                  <div className="field-value">{formatDate(record.next_inspection_date)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Landlord Details</h3>
          {formatContactDetails(record.landlord_details)}
        </div>

        <div className="section">
          <h3>Site Details</h3>
          {formatContactDetails(record.site_details)}
        </div>

        {record.appliances && record.appliances.length > 0 && (
          <div className="section">
            <h3>Appliances</h3>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Serial No</th>
                  <th>Flue Type</th>
                </tr>
              </thead>
              <tbody>
                {record.appliances.map((appliance: any, index: number) => (
                  <tr key={index}>
                    <td>{appliance.type || '-'}</td>
                    <td>{appliance.location || '-'}</td>
                    <td>{appliance.make || '-'}</td>
                    <td>{appliance.model || '-'}</td>
                    <td>{appliance.serial_no || '-'}</td>
                    <td>{appliance.flue_type || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {record.inspection_details && record.inspection_details.length > 0 && (
          <div className="section">
            <h3>Inspection Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Check</th>
                  <th>Result</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {record.inspection_details.map((detail: any, index: number) => (
                  <tr key={index}>
                    <td>{detail.check || '-'}</td>
                    <td>{detail.result || '-'}</td>
                    <td>{detail.comments || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {record.final_check_results && (
          <div className="section">
            <h3>Final Check Results</h3>
            <div className="grid">
              {Object.entries(record.final_check_results).map(([key, value]) => (
                <div key={key} className="field">
                  <div className="field-label">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</div>
                  <div className="field-value">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {record.defects_remedial && record.defects_remedial.length > 0 && (
          <div className="section">
            <h3>Defects and Remedial Actions</h3>
            <table>
              <thead>
                <tr>
                  <th>Defect</th>
                  <th>Action Required</th>
                  <th>Date Completed</th>
                </tr>
              </thead>
              <tbody>
                {record.defects_remedial.map((defect: any, index: number) => (
                  <tr key={index}>
                    <td>{defect.defect || '-'}</td>
                    <td>{defect.action || '-'}</td>
                    <td>{defect.date_completed ? formatDate(defect.date_completed) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="signature-section">
          <div className="grid">
            <div>
              <h3>Engineer Details</h3>
              {record.engineer_name && <div><strong>Name:</strong> {record.engineer_name}</div>}
              {record.gas_safe_licence && <div><strong>Gas Safe Licence:</strong> {record.gas_safe_licence}</div>}
              <div><strong>Signature:</strong></div>
              <div className="signature-box">
                {record.engineer_signature && (
                  <img
                    src={record.engineer_signature}
                    alt="Engineer signature"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
            <div>
              <h3>Received By</h3>
              {record.received_by_name && <div><strong>Name:</strong> {record.received_by_name}</div>}
              {record.received_by_position && <div><strong>Position:</strong> {record.received_by_position}</div>}
              <div><strong>Signature:</strong></div>
              <div className="signature-box">
                {record.received_by_signature && (
                  <img
                    src={record.received_by_signature}
                    alt="Received by signature"
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
                <CardTitle className="text-2xl">Gas Safety Record</CardTitle>
                <div className="mt-2 flex items-center space-x-4">
                  {record.reference_number && (
                    <span className="text-sm text-gray-500">
                      Reference: {record.reference_number}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    Created: {formatDate(record.created_at)}
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
          {/* Record Details */}
          <Card>
            <CardHeader>
              <CardTitle>Record Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Record Date:</span>
                <div className="font-medium">{formatDate(record.record_date)}</div>
              </div>
              {record.reference_number && (
                <div>
                  <span className="text-sm text-gray-500">Reference Number:</span>
                  <div className="font-medium">{record.reference_number}</div>
                </div>
              )}
              {record.serial_number && (
                <div>
                  <span className="text-sm text-gray-500">Serial Number:</span>
                  <div className="font-medium">{record.serial_number}</div>
                </div>
              )}
              {record.next_inspection_date && (
                <div>
                  <span className="text-sm text-gray-500">Next Inspection Date:</span>
                  <div className="font-medium">{formatDate(record.next_inspection_date)}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Landlord Details */}
          <Card>
            <CardHeader>
              <CardTitle>Landlord Details</CardTitle>
            </CardHeader>
            <CardContent>
              {record.landlord_details ? (
                <div className="space-y-1">
                  {record.landlord_details.name && (
                    <div className="font-medium">{record.landlord_details.name}</div>
                  )}
                  {record.landlord_details.address && (
                    <div className="text-sm text-gray-600">{record.landlord_details.address}</div>
                  )}
                  {record.landlord_details.postcode && (
                    <div className="text-sm text-gray-600">{record.landlord_details.postcode}</div>
                  )}
                  {record.landlord_details.contact_number && (
                    <div className="text-sm text-gray-600">Tel: {record.landlord_details.contact_number}</div>
                  )}
                  {record.landlord_details.email && (
                    <div className="text-sm text-gray-600">Email: {record.landlord_details.email}</div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No landlord details provided</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Site Details */}
        <Card>
          <CardHeader>
            <CardTitle>Site Details</CardTitle>
          </CardHeader>
          <CardContent>
            {record.site_details ? (
              <div className="space-y-1">
                {record.site_details.name && (
                  <div className="font-medium">{record.site_details.name}</div>
                )}
                {record.site_details.address && (
                  <div className="text-sm text-gray-600">{record.site_details.address}</div>
                )}
                {record.site_details.postcode && (
                  <div className="text-sm text-gray-600">{record.site_details.postcode}</div>
                )}
                {record.site_details.contact_number && (
                  <div className="text-sm text-gray-600">Tel: {record.site_details.contact_number}</div>
                )}
                {record.site_details.email && (
                  <div className="text-sm text-gray-600">Email: {record.site_details.email}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No site details provided</div>
            )}
          </CardContent>
        </Card>

        {/* Appliances */}
        {record.appliances && record.appliances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Appliances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Type</th>
                      <th className="text-left py-2 font-medium text-gray-900">Location</th>
                      <th className="text-left py-2 font-medium text-gray-900">Make</th>
                      <th className="text-left py-2 font-medium text-gray-900">Model</th>
                      <th className="text-left py-2 font-medium text-gray-900">Serial No</th>
                      <th className="text-left py-2 font-medium text-gray-900">Flue Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.appliances.map((appliance: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{appliance.type || '-'}</td>
                        <td className="py-3 text-gray-600">{appliance.location || '-'}</td>
                        <td className="py-3 text-gray-600">{appliance.make || '-'}</td>
                        <td className="py-3 text-gray-600">{appliance.model || '-'}</td>
                        <td className="py-3 text-gray-600">{appliance.serial_no || '-'}</td>
                        <td className="py-3 text-gray-600">{appliance.flue_type || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Inspection Details */}
        {record.inspection_details && record.inspection_details.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Inspection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Check</th>
                      <th className="text-left py-2 font-medium text-gray-900">Result</th>
                      <th className="text-left py-2 font-medium text-gray-900">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.inspection_details.map((detail: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{detail.check || '-'}</td>
                        <td className="py-3 text-gray-600">{detail.result || '-'}</td>
                        <td className="py-3 text-gray-600">{detail.comments || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Check Results */}
        {record.final_check_results && (
          <Card>
            <CardHeader>
              <CardTitle>Final Check Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(record.final_check_results).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                    <span className="text-sm text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Defects and Remedial Actions */}
        {record.defects_remedial && record.defects_remedial.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Defects and Remedial Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-medium text-gray-900">Defect</th>
                      <th className="text-left py-2 font-medium text-gray-900">Action Required</th>
                      <th className="text-left py-2 font-medium text-gray-900">Date Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.defects_remedial.map((defect: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-gray-900">{defect.defect || '-'}</td>
                        <td className="py-3 text-gray-600">{defect.action || '-'}</td>
                        <td className="py-3 text-gray-600">
                          {defect.date_completed ? formatDate(defect.date_completed) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {record.engineer_name && (
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <div className="font-medium">{record.engineer_name}</div>
                    </div>
                  )}
                  {record.gas_safe_licence && (
                    <div>
                      <span className="text-sm text-gray-500">Gas Safe Licence:</span>
                      <div className="font-medium">{record.gas_safe_licence}</div>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500">Signature:</span>
                  <div className="mt-2 border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                    {record.engineer_signature ? (
                      <img
                        src={record.engineer_signature}
                        alt="Engineer signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">No signature provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Received By Signature */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Received By</h4>
                <div className="space-y-2">
                  {record.received_by_name && (
                    <div>
                      <span className="text-sm text-gray-500">Name:</span>
                      <div className="font-medium">{record.received_by_name}</div>
                    </div>
                  )}
                  {record.received_by_position && (
                    <div>
                      <span className="text-sm text-gray-500">Position:</span>
                      <div className="font-medium">{record.received_by_position}</div>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-sm text-gray-500">Signature:</span>
                  <div className="mt-2 border border-gray-300 rounded h-24 flex items-center justify-center bg-gray-50">
                    {record.received_by_signature ? (
                      <img
                        src={record.received_by_signature}
                        alt="Received by signature"
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