'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GasSafetyRecord, Appliance, InspectionDetail, ContactDetails, FinalCheckResults, DefectRemedial } from '@/types'
import { FormField, TextAreaField, SelectField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { ClientSelector } from '@/components/clients/ClientSelector'
import { useClients } from '@/contexts/ClientContext'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui/Loading'
import { AutoSaveForm } from '@/components/ui/AutoSaveForm'
import { getErrorMessage, getNestedErrorMessage } from '@/utils/formErrors'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import { InspectionDetailsSection } from './InspectionDetailsSection'
import { FinalCheckSection } from './FinalCheckSection'
import { DefectsSection } from './DefectsSection'
import { SignatureSection } from './SignatureSection'

// Validation schema
const gasSafetySchema = z.object({
  client_id: z.string().optional(),
  record_date: z.string().min(1, 'Record date is required'),
  reference_number: z.string().optional(),
  serial_number: z.string().optional(),
  landlord_details: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    postcode: z.string().optional(),
    contact_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
  site_details: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    postcode: z.string().optional(),
    contact_number: z.string().optional(),
    email: z.string().email().optional().or(z.literal(''))
  }).optional(),
  appliances: z.array(z.object({
    location: z.string().min(1, 'Location is required'),
    type: z.string().min(1, 'Type is required'),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    owned_by_landlord: z.string().optional(),
    appliance_inspected: z.string().optional(),
    flue_type: z.string().optional()
  })).min(1, 'At least one appliance is required'),
  inspection_details: z.array(z.object({
    operating_pressure: z.string().optional(),
    safety_devices: z.string().optional(),
    ventilation: z.string().optional(),
    flue_condition: z.string().optional(),
    flue_operation: z.string().optional(),
    combustion_reading: z.string().optional(),
    appliance_serviced: z.string().optional(),
    safe_to_use: z.string().optional(),
    visual_inspection_only: z.string().optional()
  })),
  final_check_results: z.object({
    gas_tightness_test: z.string().optional(),
    protective_bonding: z.string().optional(),
    emergency_control: z.string().optional(),
    pipework_inspection: z.string().optional(),
    co_alarm: z.string().optional(),
    smoke_alarm: z.string().optional(),
    notes: z.string().optional()
  }).optional(),
  defects_remedial: z.array(z.object({
    defects_identified: z.string().optional(),
    remedial_work: z.string().optional(),
    label_warning: z.string().optional(),
    co_low: z.string().optional(),
    co2_ratio_low: z.string().optional(),
    co_high: z.string().optional(),
    co2_ratio_high: z.string().optional()
  })),
  next_inspection_date: z.string().optional(),
  engineer_name: z.string().min(1, 'Engineer name is required'),
  gas_safe_licence: z.string().min(1, 'Gas Safe licence number is required'),
  engineer_signature: z.string().optional(),
  received_by_name: z.string().optional(),
  received_by_position: z.string().optional(),
  received_by_signature: z.string().optional()
})

type GasSafetyFormData = z.infer<typeof gasSafetySchema>

interface GasSafetyFormProps {
  initialData?: Partial<GasSafetyRecord>
  onSubmit: (data: GasSafetyFormData) => Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function GasSafetyForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create'
}: GasSafetyFormProps) {
  const { user, profile } = useAuth()
  const { selectedClient, selectClient, getClientById } = useClients()
  const { navigateWithCheck } = useUnsavedChanges()
  
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<GasSafetyFormData>({
    resolver: zodResolver(gasSafetySchema),
    defaultValues: {
      record_date: new Date().toISOString().split('T')[0],
      engineer_name: profile?.company_name || user?.email || '',
      gas_safe_licence: profile?.gas_safe_reg_no || '',
      engineer_signature: initialData?.engineer_signature || '',
      received_by_signature: initialData?.received_by_signature || '',
      appliances: [{ location: '', type: '', manufacturer: '', model: '' }],
      inspection_details: [{}],
      defects_remedial: [{}],
      landlord_details: {},
      site_details: {},
      final_check_results: {},
      ...initialData
    }
  })

  // Watch all form data for auto-save
  const formData = watch()

  const {
    fields: applianceFields,
    append: appendAppliance,
    remove: removeAppliance
  } = useFieldArray({
    control,
    name: 'appliances'
  })

  const {
    fields: inspectionFields,
    append: appendInspection,
    remove: removeInspection
  } = useFieldArray({
    control,
    name: 'inspection_details'
  })

  const {
    fields: defectFields,
    append: appendDefect,
    remove: removeDefect
  } = useFieldArray({
    control,
    name: 'defects_remedial'
  })

  // Auto-populate client details when client is selected
  useEffect(() => {
    if (selectedClient) {
      setValue('client_id', selectedClient.id)
      setValue('landlord_details.name', selectedClient.name)
      setValue('landlord_details.address', selectedClient.address || '')
      setValue('landlord_details.postcode', selectedClient.postcode || '')
      setValue('landlord_details.contact_number', selectedClient.contact_number || '')
      setValue('landlord_details.email', selectedClient.email || '')
    }
  }, [selectedClient, setValue])

  // Initialize client if editing existing record
  useEffect(() => {
    if (initialData?.client_id && !selectedClient) {
      const client = getClientById(initialData.client_id)
      if (client) {
        selectClient(client)
      }
    }
  }, [initialData?.client_id, selectedClient, getClientById, selectClient])

  const applianceTypes = [
    { value: '', label: 'Select type...' },
    { value: 'Boiler', label: 'Boiler' },
    { value: 'Fire', label: 'Fire' },
    { value: 'Cooker', label: 'Cooker' },
    { value: 'Water Heater', label: 'Water Heater' },
    { value: 'Other', label: 'Other' }
  ]

  const yesNoOptions = [
    { value: '', label: 'Select...' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ]

  const passFailOptions = [
    { value: '', label: 'Select...' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' },
    { value: 'N/A', label: 'N/A' }
  ]

  const handleDraftRestore = (draftData: Record<string, any>) => {
    // Restore form data from draft
    Object.keys(draftData).forEach(key => {
      if (key in formData) {
        setValue(key as keyof GasSafetyFormData, draftData[key])
      }
    })
  }

  const handleFormSubmit = async (data: GasSafetyFormData) => {
    console.log('Form submission triggered with data:', data)
    console.log('Form errors:', errors)
    
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <AutoSaveForm
      formType="gas_safety"
      formData={formData}
      onDraftRestore={handleDraftRestore}
      enableAutoSave={mode === 'create'}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Gas Safety Record Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="record_date"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Record Date"
                  type="date"
                  required
                  error={getErrorMessage(errors.record_date)}
                  {...field}
                />
              )}
            />
            <Controller
              name="reference_number"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Reference Number"
                  placeholder="Enter reference number"
                  {...field}
                />
              )}
            />
            <Controller
              name="serial_number"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Serial Number"
                  placeholder="Enter serial number"
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

      {/* Landlord Details */}
      <Card>
        <CardHeader>
          <CardTitle>Landlord Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="landlord_details.name"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Name"
                  placeholder="Enter landlord name"
                  {...field}
                />
              )}
            />
            <Controller
              name="landlord_details.contact_number"
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
              name="landlord_details.address"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Address"
                  placeholder="Enter address"
                  {...field}
                />
              )}
            />
            <Controller
              name="landlord_details.postcode"
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
            name="landlord_details.email"
            control={control}
            render={({ field }) => (
              <FormField
                label="Email"
                type="email"
                placeholder="Enter email address"
                error={getNestedErrorMessage(errors, 'landlord_details.email')}
                {...field}
              />
            )}
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
        </CardContent>
      </Card>

      {/* Appliances */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Appliances</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendAppliance({ location: '', type: '', manufacturer: '', model: '' })}
            >
              + Add Appliance
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {applianceFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-900">
                  Appliance {index + 1}
                </h4>
                {applianceFields.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => removeAppliance(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  name={`appliances.${index}.location`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Location"
                      placeholder="e.g., Kitchen, Living Room"
                      required
                      error={getNestedErrorMessage(errors, `appliances.${index}.location`)}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`appliances.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Type"
                      options={applianceTypes}
                      required
                      error={getNestedErrorMessage(errors, `appliances.${index}.type`)}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`appliances.${index}.manufacturer`}
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
                  name={`appliances.${index}.model`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Model"
                      placeholder="Enter model"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`appliances.${index}.owned_by_landlord`}
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Owned by Landlord"
                      options={yesNoOptions}
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`appliances.${index}.flue_type`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="Flue Type"
                      placeholder="Enter flue type"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          ))}
          {errors.appliances && (
            <p className="text-sm text-red-600">{errors.appliances.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Inspection Details */}
      <InspectionDetailsSection control={control} errors={errors} />

      {/* Final Check Results */}
      <FinalCheckSection control={control} errors={errors} />

      {/* Defects & Remedial Work */}
      <DefectsSection control={control} errors={errors} />

      {/* Signatures and Next Inspection */}
      <SignatureSection control={control} errors={errors} />

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
          {mode === 'create' ? 'Create Record' : 'Update Record'}
        </Button>
      </div>
    </form>
    </AutoSaveForm>
  )
}