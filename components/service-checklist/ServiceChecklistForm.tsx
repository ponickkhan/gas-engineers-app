'use client'

import React, { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ServiceChecklist, ApplianceDetails, ContactDetails, SafetySummary } from '@/types'
import { FormField, TextAreaField, SelectField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClientSelector } from '@/components/clients/ClientSelector'
import { SignatureUpload } from '@/components/ui/SignatureUpload'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { AutoSaveForm } from '@/components/ui/AutoSaveForm'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { getErrorMessage, getNestedErrorMessage } from '@/utils/formErrors'

// Validation schema
const serviceChecklistSchema = z.object({
  client_id: z.string().optional(),
  site_details: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    postcode: z.string().optional(),
    contact_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
  appliance_details: z.object({
    location: z.string().optional(),
    owned_by_landlord: z.string().optional(),
    type: z.string().optional(),
    model: z.string().optional(),
    flue_type: z.string().optional(),
    manufacturer: z.string().optional(),
    serial_no: z.string().optional()
  }).optional(),
  installation_checks: z.record(z.string()).optional(),
  appliance_checks: z.record(z.any()).optional(),
  safety_summary: z.object({
    safe_to_use: z.string().optional(),
    giusp_classification: z.string().optional(),
    warning_notice: z.string().optional()
  }).optional(),
  completion_date: z.string().optional(),
  next_service_date: z.string().optional(),
  engineer_name: z.string().min(1, 'Engineer name is required'),
  engineer_licence: z.string().min(1, 'Engineer licence number is required'),
  engineer_signature: z.string().optional(),
  client_name: z.string().optional(),
  client_position: z.string().optional(),
  client_signature: z.string().optional()
})

type ServiceChecklistFormData = z.infer<typeof serviceChecklistSchema>

interface ServiceChecklistFormProps {
  initialData?: Partial<ServiceChecklist>
  onSubmit: (data: ServiceChecklistFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function ServiceChecklistForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}: ServiceChecklistFormProps) {
  const { user, profile } = useAuth()
  const { selectedClient, selectClient, getClientById } = useClients()
  const { navigateWithCheck } = useUnsavedChanges()
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ServiceChecklistFormData>({
    resolver: zodResolver(serviceChecklistSchema),
    defaultValues: {
      completion_date: new Date().toISOString().split('T')[0],
      engineer_name: profile?.company_name || user?.email || '',
      engineer_licence: profile?.gas_safe_reg_no || '',
      engineer_signature: initialData?.engineer_signature || '',
      client_signature: initialData?.client_signature || '',
      site_details: {},
      appliance_details: {},
      installation_checks: {},
      appliance_checks: {},
      safety_summary: {},
      ...initialData
    }
  })

  // Watch all form data for auto-save
  const formData = watch()

  // Auto-populate client details when client is selected
  useEffect(() => {
    if (selectedClient) {
      setValue('client_id', selectedClient.id)
      setValue('site_details.name', selectedClient.name)
      setValue('site_details.address', selectedClient.address || '')
      setValue('site_details.postcode', selectedClient.postcode || '')
      setValue('site_details.contact_number', selectedClient.contact_number || '')
      setValue('site_details.email', selectedClient.email || '')
    }
  }, [selectedClient, setValue])

  // Initialize client if editing existing checklist
  useEffect(() => {
    if (initialData?.client_id && !selectedClient) {
      const client = getClientById(initialData.client_id)
      if (client) {
        selectClient(client)
      }
    }
  }, [initialData?.client_id, selectedClient, getClientById, selectClient])

  const yesNoOptions = [
    { value: '', label: 'Select...' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ]

  const passFailNaOptions = [
    { value: '', label: 'Select...' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' },
    { value: 'N/A', label: 'N/A' }
  ]

  const applianceTypes = [
    { value: '', label: 'Select type...' },
    { value: 'Boiler', label: 'Boiler' },
    { value: 'Fire', label: 'Fire' },
    { value: 'Cooker', label: 'Cooker' },
    { value: 'Water Heater', label: 'Water Heater' },
    { value: 'Other', label: 'Other' }
  ]

  const giuspOptions = [
    { value: '', label: 'Select classification...' },
    { value: 'Immediately Dangerous', label: 'Immediately Dangerous' },
    { value: 'At Risk', label: 'At Risk' },
    { value: 'Not to Current Standards', label: 'Not to Current Standards' },
    { value: 'Satisfactory', label: 'Satisfactory' }
  ]

  // Installation check items
  const installationCheckItems = [
    'Gas supply pipework',
    'Emergency control valve',
    'Meter installation',
    'Pipework supports',
    'Protective bonding',
    'Ventilation',
    'Flue/chimney',
    'Combustion air supply'
  ]

  // Appliance check items
  const applianceCheckItems = [
    'Visual inspection',
    'Operating pressure',
    'Burner pressure',
    'Heat input',
    'Safety devices',
    'Flue flow',
    'Combustion analysis',
    'Gas tightness',
    'Operational check'
  ]

  const handleDraftRestore = (draftData: Record<string, any>) => {
    // Restore form data from draft
    Object.keys(draftData).forEach(key => {
      if (key in formData) {
        setValue(key as keyof ServiceChecklistFormData, draftData[key])
      }
    })
  }

  const handleFormSubmit = async (data: ServiceChecklistFormData) => {
    console.log('Service checklist form submission triggered with data:', data)
    console.log('Form errors:', errors)
    
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Service checklist form submission error:', error)
    }
  }

  return (
    <AutoSaveForm
      formType="service_checklist"
      formData={formData}
      onDraftRestore={handleDraftRestore}
      enableAutoSave={mode === 'create'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Service & Maintenance Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="completion_date"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Completion Date"
                  type="date"
                  {...field}
                />
              )}
            />
            <Controller
              name="next_service_date"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Next Service Date"
                  type="date"
                  helperText="Recommended date for next service"
                  {...field}
                />
              )}
            />
          </div>
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

      {/* Site Details */}
      <Card>
        <CardHeader>
          <CardTitle>Site Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="site_details.name"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Site Name"
                  placeholder="Enter site name"
                  {...field}
                />
              )}
            />
            <Controller
              name="site_details.contact_number"
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
              name="site_details.address"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Address"
                  placeholder="Enter site address"
                  {...field}
                />
              )}
            />
            <Controller
              name="site_details.postcode"
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
            name="site_details.email"
            control={control}
            render={({ field }) => (
              <FormField
                label="Email"
                type="email"
                placeholder="Enter email address"
                error={getNestedErrorMessage(errors, 'site_details.email')}
                {...field}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Appliance Details */}
      <Card>
        <CardHeader>
          <CardTitle>Appliance Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="appliance_details.location"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Location"
                  placeholder="e.g., Kitchen, Boiler Room"
                  {...field}
                />
              )}
            />
            <Controller
              name="appliance_details.type"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Appliance Type"
                  options={applianceTypes}
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="appliance_details.manufacturer"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Manufacturer"
                  placeholder="Enter manufacturer"
                  {...field}
                />
              )}
            />
            <Controller
              name="appliance_details.model"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Model"
                  placeholder="Enter model"
                  {...field}
                />
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="appliance_details.serial_no"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Serial Number"
                  placeholder="Enter serial number"
                  {...field}
                />
              )}
            />
            <Controller
              name="appliance_details.owned_by_landlord"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Owned by Landlord"
                  options={yesNoOptions}
                  {...field}
                />
              )}
            />
          </div>
          <Controller
            name="appliance_details.flue_type"
            control={control}
            render={({ field }) => (
              <FormField
                label="Flue Type"
                placeholder="Enter flue type"
                {...field}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Installation Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Installation Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {installationCheckItems.map((item) => (
              <Controller
                key={item}
                name={`installation_checks.${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={item}
                    options={passFailNaOptions}
                    {...field}
                  />
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appliance Checks */}
      <Card>
        <CardHeader>
          <CardTitle>Appliance Checks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applianceCheckItems.map((item) => (
              <Controller
                key={item}
                name={`appliance_checks.${item.toLowerCase().replace(/[^a-z0-9]/g, '_')}`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label={item}
                    options={passFailNaOptions}
                    {...field}
                  />
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="safety_summary.safe_to_use"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="Safe to Use"
                  options={yesNoOptions}
                  {...field}
                />
              )}
            />
            <Controller
              name="safety_summary.giusp_classification"
              control={control}
              render={({ field }) => (
                <SelectField
                  label="GIUSP Classification"
                  options={giuspOptions}
                  {...field}
                />
              )}
            />
          </div>
          <Controller
            name="safety_summary.warning_notice"
            control={control}
            render={({ field }) => (
              <TextAreaField
                label="Warning Notice Details"
                placeholder="Enter details of any warning notices issued..."
                rows={3}
                {...field}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Engineer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Engineer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="engineer_name"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Engineer Name"
                  placeholder="Enter engineer name"
                  required
                  error={getErrorMessage(errors.engineer_name)}
                  {...field}
                />
              )}
            />
            <Controller
              name="engineer_licence"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Gas Safe Licence Number"
                  placeholder="Enter Gas Safe licence number"
                  required
                  error={getErrorMessage(errors.engineer_licence)}
                  {...field}
                />
              )}
            />
          </div>
          
          {/* Engineer Signature Upload */}
          <Controller
            name="engineer_signature"
            control={control}
            render={({ field }) => (
              <SignatureUpload
                value={field.value}
                onChange={field.onChange}
                label="Engineer Signature"
                className="mt-4"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Client Acknowledgment */}
      <Card>
        <CardHeader>
          <CardTitle>Client Acknowledgment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="client_name"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Client Name"
                  placeholder="Enter client name"
                  {...field}
                />
              )}
            />
            <Controller
              name="client_position"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Position/Title"
                  placeholder="Enter position or title"
                  {...field}
                />
              )}
            />
          </div>
          
          {/* Client Signature Upload */}
          <Controller
            name="client_signature"
            control={control}
            render={({ field }) => (
              <SignatureUpload
                value={field.value}
                onChange={field.onChange}
                label="Client Signature"
                className="mt-4"
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('Current form data:', formData)
                  console.log('Form errors:', errors)
                  console.log('Form is valid:', Object.keys(errors).length === 0)
                }}
              >
                Log Form State
              </Button>
              {Object.keys(errors).length > 0 && (
                <div className="text-sm text-red-600">
                  <p>Form has {Object.keys(errors).length} validation errors</p>
                  <pre className="mt-2 text-xs bg-red-50 p-2 rounded">
                    {JSON.stringify(errors, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
          {mode === 'create' ? 'Create Checklist' : 'Update Checklist'}
        </Button>
      </div>
    </form>
    </AutoSaveForm>
  )
}