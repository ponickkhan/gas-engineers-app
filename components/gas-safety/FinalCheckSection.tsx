'use client'

import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { FormField, SelectField, TextAreaField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface FinalCheckSectionProps {
  control: Control<any>
  errors: FieldErrors<any>
}

export function FinalCheckSection({ control, errors }: FinalCheckSectionProps) {
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
        <CardTitle>Final Check Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Controller
            name="final_check_results.gas_tightness_test"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Gas Tightness Test"
                options={passFailOptions}
                {...field}
              />
            )}
          />
          <Controller
            name="final_check_results.protective_bonding"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Protective Bonding"
                options={passFailOptions}
                {...field}
              />
            )}
          />
          <Controller
            name="final_check_results.emergency_control"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Emergency Control"
                options={passFailOptions}
                {...field}
              />
            )}
          />
          <Controller
            name="final_check_results.pipework_inspection"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Pipework Inspection"
                options={passFailOptions}
                {...field}
              />
            )}
          />
          <Controller
            name="final_check_results.co_alarm"
            control={control}
            render={({ field }) => (
              <SelectField
                label="CO Alarm"
                options={yesNoOptions}
                {...field}
              />
            )}
          />
          <Controller
            name="final_check_results.smoke_alarm"
            control={control}
            render={({ field }) => (
              <SelectField
                label="Smoke Alarm"
                options={yesNoOptions}
                {...field}
              />
            )}
          />
        </div>
        <Controller
          name="final_check_results.notes"
          control={control}
          render={({ field }) => (
            <TextAreaField
              label="Additional Notes"
              placeholder="Enter any additional notes or observations..."
              rows={4}
              {...field}
            />
          )}
        />
      </CardContent>
    </Card>
  )
}