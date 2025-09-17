'use client'

import React, { useEffect, useCallback } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Invoice } from '@/types'
import { FormField, TextAreaField, SelectField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClientSelector } from '@/components/clients/ClientSelector'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { AutoSaveForm } from '@/components/ui/AutoSaveForm'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { getErrorMessage, getNestedErrorMessage } from '@/utils/formErrors'

// Simplified validation schema for debugging
const invoiceSchema = z.object({
  client_id: z.string().optional(),
  invoice_number: z.string().min(1, 'Invoice number is required'),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  reference_po: z.string().optional(),
  bill_to_details: z.any().optional(),
  line_items: z.array(z.any()).min(1, 'At least one line item is required'),
  subtotal: z.number(),
  vat_total: z.number(),
  grand_total: z.number(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid'])
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

interface InvoiceFormProps {
  initialData?: Partial<Invoice>
  onSubmit: (data: InvoiceFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function InvoiceForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}: InvoiceFormProps) {
  const { profile } = useAuth()
  const { selectedClient, selectClient, getClientById } = useClients()

  // Generate invoice number
  const generateInvoiceNumber = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `INV-${year}${month}-${random}`
  }

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoice_number: initialData?.invoice_number || generateInvoiceNumber(),
      invoice_date: initialData?.invoice_date || new Date().toISOString().split('T')[0],
      due_date: initialData?.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      line_items: (initialData?.line_items && initialData.line_items.length > 0) ? initialData.line_items : [{ description: '', quantity: 1, unit_price: 0, vat_rate: 20, line_total: 0 }],
      subtotal: initialData?.subtotal || 0,
      vat_total: initialData?.vat_total || 0,
      grand_total: initialData?.grand_total || 0,
      status: initialData?.status || 'draft',
      bill_to_details: initialData?.bill_to_details || {
        name: '',
        address: '',
        postcode: '',
        contact_number: '',
        email: ''
      },
      client_id: initialData?.client_id || '',
      reference_po: initialData?.reference_po || '',
      notes: initialData?.notes || ''
    }
  })

  const {
    fields: lineItemFields,
    append: appendLineItem,
    remove: removeLineItem
  } = useFieldArray({
    control,
    name: 'line_items'
  })

  // Watch all form data for auto-save
  const formData = watch()

  // Watch line items for calculations
  const watchedLineItems = watch('line_items')

  // Calculate totals
  const calculateTotals = useCallback(() => {
    let subtotal = 0
    let vatTotal = 0

    watchedLineItems.forEach((item, index) => {
      const quantity = Number(item.quantity) || 0
      const unitPrice = Number(item.unit_price) || 0
      const vatRate = Number(item.vat_rate) || 0

      const lineTotal = quantity * unitPrice
      const lineVat = (lineTotal * vatRate) / 100

      subtotal += lineTotal
      vatTotal += lineVat

      // Update line total
      setValue(`line_items.${index}.line_total`, lineTotal)
    })

    const grandTotal = subtotal + vatTotal

    setValue('subtotal', subtotal)
    setValue('vat_total', vatTotal)
    setValue('grand_total', grandTotal)
  }, [watchedLineItems, setValue])

  // Recalculate totals when line items change
  useEffect(() => {
    calculateTotals()
  }, [calculateTotals])

  // Auto-populate client details when client is selected
  useEffect(() => {
    if (selectedClient) {
      setValue('client_id', selectedClient.id)
      setValue('bill_to_details.name', selectedClient.name)
      setValue('bill_to_details.address', selectedClient.address || '')
      setValue('bill_to_details.postcode', selectedClient.postcode || '')
      setValue('bill_to_details.contact_number', selectedClient.contact_number || '')
      setValue('bill_to_details.email', selectedClient.email || '')
    }
  }, [selectedClient, setValue])

  // Initialize client if editing existing invoice
  useEffect(() => {
    if (initialData?.client_id && !selectedClient) {
      const client = getClientById(initialData.client_id)
      if (client) {
        selectClient(client)
      }
    }
  }, [initialData?.client_id, selectedClient, getClientById, selectClient])

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' }
  ]

  const vatRateOptions = [
    { value: '0', label: '0%' },
    { value: '5', label: '5%' },
    { value: '20', label: '20%' }
  ]

  const handleDraftRestore = (draftData: Record<string, any>) => {
    // Restore form data from draft
    Object.keys(draftData).forEach(key => {
      if (key in formData) {
        setValue(key as keyof InvoiceFormData, draftData[key])
      }
    })
  }

  const handleFormSubmit = async (data: InvoiceFormData) => {
    console.log('Form validation passed, submitting data:', data)
    console.log('Form errors:', errors)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleFormError = (errors: any) => {
    console.error('Form validation errors:', errors)
  }

  return (
    <AutoSaveForm
      formType="invoice"
      formData={formData}
      onDraftRestore={handleDraftRestore}
      enableAutoSave={mode === 'create'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-6">
        {/* Form Validation Errors */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([key, error]) => (
                <li key={key}>
                  <strong>{key}:</strong> {error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug Info */}
        {mode === 'create' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Info:</h3>
            <div className="text-xs text-blue-700">
              <p>Form Data: {JSON.stringify(formData, null, 2)}</p>
              <p>Errors: {JSON.stringify(errors, null, 2)}</p>
            </div>
          </div>
        )}

        {/* Header Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Controller
                name="invoice_number"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Invoice Number"
                    placeholder="Enter invoice number"
                    required
                    error={getErrorMessage(errors.invoice_number)}
                    {...field}
                  />
                )}
              />
              <Controller
                name="invoice_date"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Invoice Date"
                    type="date"
                    required
                    error={getErrorMessage(errors.invoice_date)}
                    {...field}
                  />
                )}
              />
              <Controller
                name="due_date"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Due Date"
                    type="date"
                    required
                    error={getErrorMessage(errors.due_date)}
                    {...field}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Status"
                    options={statusOptions}
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="reference_po"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Reference/PO Number"
                  placeholder="Enter reference or purchase order number"
                  {...field}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Client Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Client Selection</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientSelector
              selectedClient={selectedClient}
              onClientSelect={selectClient}
              placeholder="Search and select a client..."
            />
          </CardContent>
        </Card>

        {/* Bill To Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bill To Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="bill_to_details.name"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Name"
                    placeholder="Enter billing name"
                    {...field}
                  />
                )}
              />
              <Controller
                name="bill_to_details.contact_number"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Contact Number"
                    type="tel"
                    placeholder="Enter contact number"
                    {...field}
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="bill_to_details.address"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Address"
                    placeholder="Enter billing address"
                    {...field}
                  />
                )}
              />
              <Controller
                name="bill_to_details.postcode"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Postcode"
                    placeholder="Enter postcode"
                    {...field}
                  />
                )}
              />
            </div>
            <Controller
              name="bill_to_details.email"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  error={getNestedErrorMessage(errors, 'bill_to_details.email')}
                  {...field}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Line Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendLineItem({ description: '', quantity: 1, unit_price: 0, vat_rate: 20, line_total: 0 })}
              >
                + Add Line Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {lineItemFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Line Item {index + 1}
                  </h4>
                  {lineItemFields.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <Controller
                      name={`line_items.${index}.description`}
                      control={control}
                      render={({ field }) => (
                        <FormField
                          label="Description"
                          placeholder="Enter item description"
                          required
                          error={errors.line_items?.[index] && 'description' in errors.line_items[index] ? String(errors.line_items[index].description?.message || '') : undefined}
                          {...field}
                        />
                      )}
                    />
                  </div>
                  <Controller
                    name={`line_items.${index}.quantity`}
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <FormField
                        label="Quantity"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="1"
                        required
                        error={errors.line_items?.[index] && 'quantity' in errors.line_items[index] ? String(errors.line_items[index].quantity?.message || '') : undefined}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name={`line_items.${index}.unit_price`}
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <FormField
                        label="Unit Price (£)"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        required
                        error={errors.line_items?.[index] && 'unit_price' in errors.line_items[index] ? String(errors.line_items[index].unit_price?.message || '') : undefined}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseFloat(e.target.value) || 0)}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name={`line_items.${index}.vat_rate`}
                    control={control}
                    render={({ field: { onChange, ...field } }) => (
                      <SelectField
                        label="VAT Rate"
                        options={vatRateOptions}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(parseFloat(e.target.value) || 0)}
                        {...field}
                      />
                    )}
                  />
                </div>
                <div className="mt-4 text-right">
                  <span className="text-sm text-gray-500">Line Total: </span>
                  <span className="font-medium">
                    £{(watchedLineItems[index]?.line_total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            {errors.line_items && (
              <p className="text-sm text-red-600">{errors.line_items.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Totals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">£{watch('subtotal')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VAT Total:</span>
                <span className="font-medium">£{watch('vat_total')?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>£{watch('grand_total')?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <TextAreaField
                  label="Notes"
                  placeholder="Enter any additional notes or terms..."
                  rows={4}
                  {...field}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {mode === 'create' ? 'Create Invoice' : 'Update Invoice'}
          </Button>
        </div>
      </form>
    </AutoSaveForm>
  )
}