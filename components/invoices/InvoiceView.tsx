'use client'

import React from 'react'
import { Invoice } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
// Utility functions for formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(amount)
}
import { useAuth } from '@/contexts/AuthContext'

interface InvoiceViewProps {
  invoice: Invoice
  onEdit?: () => void
  onPrint?: () => void
  showActions?: boolean
}

export function InvoiceView({ 
  invoice, 
  onEdit, 
  onPrint, 
  showActions = true 
}: InvoiceViewProps) {
  const { profile } = useAuth()

  // Add print styles when component mounts
  React.useEffect(() => {
    const printStyles = `
      @media print {
        body * { visibility: hidden; }
        #invoice-print-content, #invoice-print-content * { visibility: visible; }
        #invoice-print-content { position: absolute; left: 0; top: 0; width: 100%; }
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success'
      case 'sent': return 'info'
      case 'draft': return 'warning'
      default: return 'default'
    }
  }

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      // Default print functionality
      const printContent = document.getElementById('invoice-print-content')
      if (printContent) {
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Invoice ${invoice.invoice_number}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  .header { text-align: center; margin-bottom: 30px; }
                  .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
                  .section { margin-bottom: 20px; }
                  .section h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f5f5f5; }
                  .text-right { text-align: right; }
                  .totals { margin-top: 20px; }
                  .totals table { width: 300px; margin-left: auto; }
                  .grand-total { font-weight: bold; font-size: 1.1em; }
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
  }

  return (
    <div className="space-y-6">
      {/* Print-friendly content */}
      <div id="invoice-print-content" className="hidden print:block">
        <div className="header">
          <h1>INVOICE</h1>
          <h2>Invoice #{invoice.invoice_number}</h2>
        </div>
        
        <div className="invoice-details">
          <div>
            <h3>From:</h3>
            <div>Orient Gas Engineers LTD</div>
            {profile?.company_name && profile.company_name !== 'Orient Gas Engineers LTD' && (
              <div>{profile.company_name}</div>
            )}
            {profile?.address && <div>{profile.address}</div>}
            {profile?.postcode && <div>{profile.postcode}</div>}
            {profile?.contact_number && <div>Tel: {profile.contact_number}</div>}
            {profile?.gas_safe_reg_no && <div>Gas Safe Reg: {profile.gas_safe_reg_no}</div>}
          </div>
          
          <div>
            <h3>Bill To:</h3>
            {invoice.bill_to_details ? (
              <div>
                {invoice.bill_to_details.name && <div>{invoice.bill_to_details.name}</div>}
                {invoice.bill_to_details.address && <div>{invoice.bill_to_details.address}</div>}
                {invoice.bill_to_details.postcode && <div>{invoice.bill_to_details.postcode}</div>}
                {invoice.bill_to_details.contact_number && <div>Tel: {invoice.bill_to_details.contact_number}</div>}
                {invoice.bill_to_details.email && <div>Email: {invoice.bill_to_details.email}</div>}
              </div>
            ) : (
              <div>No billing details provided</div>
            )}
          </div>
          
          <div>
            <h3>Invoice Details:</h3>
            <div>Date: {formatDate(invoice.invoice_date)}</div>
            <div>Due Date: {formatDate(invoice.due_date)}</div>
            {invoice.reference_po && <div>Reference/PO: {invoice.reference_po}</div>}
            <div>Status: {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}</div>
          </div>
        </div>

        <div className="section">
          <h3>Line Items</h3>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>VAT</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.line_items.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.unit_price)}</td>
                  <td className="text-right">{item.vat_rate}%</td>
                  <td className="text-right">{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals">
          <table>
            <tr>
              <td>Subtotal:</td>
              <td className="text-right">{formatCurrency(invoice.subtotal)}</td>
            </tr>
            <tr>
              <td>VAT Total:</td>
              <td className="text-right">{formatCurrency(invoice.vat_total)}</td>
            </tr>
            <tr className="grand-total">
              <td>Grand Total:</td>
              <td className="text-right">{formatCurrency(invoice.grand_total)}</td>
            </tr>
          </table>
        </div>

        {invoice.notes && (
          <div className="section">
            <h3>Notes</h3>
            <div>{invoice.notes}</div>
          </div>
        )}
      </div>

      {/* Screen display content */}
      <div className="no-print">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Invoice {invoice.invoice_number}</CardTitle>
              <div className="mt-2 flex items-center space-x-4">
                <Badge variant={getStatusVariant(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created: {formatDate(invoice.created_at)}
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
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Invoice Date:</span>
                <div className="font-medium">{formatDate(invoice.invoice_date)}</div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Due Date:</span>
                <div className="font-medium">{formatDate(invoice.due_date)}</div>
              </div>
            </div>
            {invoice.reference_po && (
              <div>
                <span className="text-sm text-gray-500">Reference/PO:</span>
                <div className="font-medium">{invoice.reference_po}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill To */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.bill_to_details ? (
              <div className="space-y-1">
                {invoice.bill_to_details.name && (
                  <div className="font-medium">{invoice.bill_to_details.name}</div>
                )}
                {invoice.bill_to_details.address && (
                  <div className="text-sm text-gray-600">{invoice.bill_to_details.address}</div>
                )}
                {invoice.bill_to_details.postcode && (
                  <div className="text-sm text-gray-600">{invoice.bill_to_details.postcode}</div>
                )}
                {invoice.bill_to_details.contact_number && (
                  <div className="text-sm text-gray-600">Tel: {invoice.bill_to_details.contact_number}</div>
                )}
                {invoice.bill_to_details.email && (
                  <div className="text-sm text-gray-600">Email: {invoice.bill_to_details.email}</div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">No billing details provided</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* From Details */}
      <Card>
        <CardHeader>
          <CardTitle>From</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="font-medium">Orient Gas Engineers LTD</div>
            {profile?.company_name && profile.company_name !== 'Orient Gas Engineers LTD' && (
              <div className="text-sm text-gray-600">{profile.company_name}</div>
            )}
            {profile?.address && (
              <div className="text-sm text-gray-600">{profile.address}</div>
            )}
            {profile?.postcode && (
              <div className="text-sm text-gray-600">{profile.postcode}</div>
            )}
            {profile?.contact_number && (
              <div className="text-sm text-gray-600">Tel: {profile.contact_number}</div>
            )}
            {profile?.gas_safe_reg_no && (
              <div className="text-sm text-gray-600">Gas Safe Reg: {profile.gas_safe_reg_no}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Description</th>
                  <th className="text-right py-2 font-medium text-gray-900">Qty</th>
                  <th className="text-right py-2 font-medium text-gray-900">Unit Price</th>
                  <th className="text-right py-2 font-medium text-gray-900">VAT</th>
                  <th className="text-right py-2 font-medium text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.line_items.map((item: any, index: number) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{item.description}</td>
                    <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right text-gray-600">{item.vat_rate}%</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">VAT Total:</span>
              <span className="font-medium">{formatCurrency(invoice.vat_total)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Grand Total:</span>
              <span>{formatCurrency(invoice.grand_total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}