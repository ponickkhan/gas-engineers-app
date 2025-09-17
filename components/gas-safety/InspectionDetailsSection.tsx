'use client'

import React from 'react'
import { Control, useFieldArray, Controller, FieldErrors } from 'react-hook-form'
import { FormField, SelectField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface InspectionDetailsSectionProps {
  control: Control<any>
  errors: FieldErrors<any>
}

export function InspectionDetailsSection({ control, errors }: InspectionDetailsSectionProps) {
  const {
    fields: inspectionFields,
    append: appendInspection,
    remove: removeInspection
  } = useFieldArray({
    control,
    name: 'inspection_details'
  })

  const passFailOptions = [
    { value: '', label: 'Select...' },
    { value: 'Pass', label: 'Pass' },
    { value: 'Fail', label: 'Fail' },
    { value: 'N/A', label: 'N/A' }
  ]

  const yesNoOptions = [
    { value: '', label: 'Select...' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Inspection Details</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendInspection({})}
          >
            + Add Inspection
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {inspectionFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Inspection {index + 1}
              </h4>
              {inspectionFields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeInspection(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Controller
                name={`inspection_details.${index}.operating_pressure`}
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Operating Pressure"
                    placeholder="Enter pressure reading"
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.safety_devices`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Safety Devices"
                    options={passFailOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.ventilation`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Ventilation"
                    options={passFailOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.flue_condition`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Flue Condition"
                    options={passFailOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.flue_operation`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Flue Operation"
                    options={passFailOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.combustion_reading`}
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Combustion Reading"
                    placeholder="Enter reading"
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.appliance_serviced`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Appliance Serviced"
                    options={yesNoOptions}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`inspection_details.${index}.safe_to_use`}
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
                name={`inspection_details.${index}.visual_inspection_only`}
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Visual Inspection Only"
                    options={yesNoOptions}
                    {...field}
                  />
                )}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}