'use client'

import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { AutoSaveForm } from './AutoSaveForm'
import { FormField, TextAreaField } from './FormField'
import { Button } from './Button'
import { Card, CardHeader, CardTitle, CardContent } from './Card'
import { AutoSaveIndicator } from './AutoSaveIndicator'

interface DemoFormData {
  name: string
  email: string
  message: string
}

export function AutoSaveDemo() {
  const [formType] = useState<'gas_safety' | 'invoice' | 'service_checklist'>('gas_safety')
  
  const { control, handleSubmit, watch, setValue, reset } = useForm<DemoFormData>({
    defaultValues: {
      name: '',
      email: '',
      message: ''
    }
  })

  const formData = watch()

  const handleDraftRestore = (draftData: Record<string, any>) => {
    Object.keys(draftData).forEach(key => {
      if (key in formData) {
        setValue(key as keyof DemoFormData, draftData[key])
      }
    })
  }

  const onSubmit = (data: DemoFormData) => {
    console.log('Form submitted:', data)
    alert('Form submitted successfully!')
  }

  const handleReset = () => {
    reset()
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Save Demo</CardTitle>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              This form demonstrates the auto-save functionality. Changes are saved every 30 seconds.
            </p>
            <AutoSaveIndicator />
          </div>
        </CardHeader>
        <CardContent>
          <AutoSaveForm
            formType={formType}
            formData={formData}
            onDraftRestore={handleDraftRestore}
            enableAutoSave={true}
            showAutoSaveIndicator={false} // We're showing it in the header
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Name"
                    placeholder="Enter your name"
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <FormField
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                  />
                )}
              />
              
              <Controller
                name="message"
                control={control}
                render={({ field }) => (
                  <TextAreaField
                    label="Message"
                    rows={4}
                    placeholder="Enter your message"
                    {...field}
                  />
                )}
              />
              
              <div className="flex space-x-4">
                <Button type="submit">
                  Submit
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </AutoSaveForm>
        </CardContent>
      </Card>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Auto-Save Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Form data is automatically saved every 30 seconds</li>
          <li>• Visual indicators show save status (saving, saved, unsaved changes)</li>
          <li>• Draft restoration prompt appears when returning to forms with saved data</li>
          <li>• Unsaved changes warning when navigating away</li>
          <li>• Manual save option available</li>
        </ul>
      </div>
    </div>
  )
}