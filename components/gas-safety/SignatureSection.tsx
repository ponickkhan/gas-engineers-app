'use client'

import React from 'react'
import { Control, Controller, FieldErrors } from 'react-hook-form'
import { FormField } from '@/components/ui/FormField'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { SignatureUpload } from '@/components/ui/SignatureUpload'
import { getErrorMessage } from '@/utils/formErrors'

interface SignatureSectionProps {
  control: Control<any>
  errors: FieldErrors<any>
}

export function SignatureSection({ control, errors }: SignatureSectionProps) {
  return (
    <div className="space-y-6">
      {/* Next Inspection Date */}
      <Card>
        <CardHeader>
          <CardTitle>Next Inspection</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="next_inspection_date"
            control={control}
            render={({ field }) => (
              <FormField
                label="Next Inspection Date"
                type="date"
                helperText="Recommended date for next gas safety inspection"
                {...field}
              />
            )}
          />
        </CardContent>
      </Card>

      {/* Engineer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Engineer Details & Signature</CardTitle>
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
              name="gas_safe_licence"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Gas Safe Licence Number"
                  placeholder="Enter Gas Safe licence number"
                  required
                  error={getErrorMessage(errors.gas_safe_licence)}
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

      {/* Received By Details */}
      <Card>
        <CardHeader>
          <CardTitle>Received By & Signature</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="received_by_name"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Received By Name"
                  placeholder="Enter name of person receiving record"
                  {...field}
                />
              )}
            />
            <Controller
              name="received_by_position"
              control={control}
              render={({ field }) => (
                <FormField
                  label="Position"
                  placeholder="Enter position/title"
                  {...field}
                />
              )}
            />
          </div>
          
          {/* Received By Signature Upload */}
          <Controller
            name="received_by_signature"
            control={control}
            render={({ field }) => (
              <SignatureUpload
                value={field.value}
                onChange={field.onChange}
                label="Received By Signature"
                className="mt-4"
              />
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}