'use client'

import React from 'react'
import { Control, useFieldArray, Controller, FieldErrors } from 'react-hook-form'
import { FormField, TextAreaField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface DefectsSectionProps {
  control: Control<any>
  errors: FieldErrors<any>
}

export function DefectsSection({ control, errors }: DefectsSectionProps) {
  const {
    fields: defectFields,
    append: appendDefect,
    remove: removeDefect
  } = useFieldArray({
    control,
    name: 'defects_remedial'
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Defects & Remedial Work</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendDefect({})}
          >
            + Add Defect
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {defectFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Defect Record {index + 1}
              </h4>
              {defectFields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeDefect(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div className="space-y-4">
              <Controller
                name={`defects_remedial.${index}.defects_identified`}
                control={control}
                render={({ field }) => (
                  <TextAreaField
                    label="Defects Identified"
                    placeholder="Describe any defects found..."
                    rows={3}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`defects_remedial.${index}.remedial_work`}
                control={control}
                render={({ field }) => (
                  <TextAreaField
                    label="Remedial Work Required"
                    placeholder="Describe remedial work needed..."
                    rows={3}
                    {...field}
                  />
                )}
              />
              <Controller
                name={`defects_remedial.${index}.label_warning`}
                control={control}
                render={({ field }) => (
                  <TextAreaField
                    label="Label/Warning Notice"
                    placeholder="Details of any labels or warnings applied..."
                    rows={2}
                    {...field}
                  />
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Controller
                  name={`defects_remedial.${index}.co_low`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="CO Low (ppm)"
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`defects_remedial.${index}.co2_ratio_low`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="CO₂ Ratio Low (%)"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`defects_remedial.${index}.co_high`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="CO High (ppm)"
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  )}
                />
                <Controller
                  name={`defects_remedial.${index}.co2_ratio_high`}
                  control={control}
                  render={({ field }) => (
                    <FormField
                      label="CO₂ Ratio High (%)"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      {...field}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}