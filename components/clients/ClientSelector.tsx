'use client'

import { useState, useEffect, useRef } from 'react'
import { Client } from '@/types'
import { useClients } from '@/contexts/ClientContext'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/Loading'
import { cn } from '@/utils/cn'

interface ClientSelectorProps {
  selectedClient?: Client | null
  onClientSelect: (client: Client | null) => void
  placeholder?: string
  required?: boolean
  error?: string
  className?: string
}

export function ClientSelector({
  selectedClient,
  onClientSelect,
  placeholder = "Search or select a client...",
  required = false,
  error,
  className
}: ClientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const { clients, loading, fetchClients } = useClients()

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleClientSelect = (client: Client) => {
    onClientSelect(client)
    setIsOpen(false)
    setSearchTerm('')
  }

  const handleClearSelection = () => {
    onClientSelect(null)
    setSearchTerm('')
  }

  const handleCreateSuccess = (newClient: Client) => {
    onClientSelect(newClient)
    setShowCreateModal(false)
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Client
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={selectedClient ? selectedClient.name : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
              if (selectedClient) {
                onClientSelect(null)
              }
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className={cn(
              "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm",
              "focus:outline-none focus:ring-orient-blue focus:border-orient-blue",
              "disabled:bg-gray-50 disabled:text-gray-500",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500"
            )}
          />
          
          {selectedClient && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" className="mx-auto mb-2" />
              <p className="text-sm text-gray-500">Loading clients...</p>
            </div>
          ) : (
            <>
              {/* Create new client option */}
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(true)
                  setIsOpen(false)
                }}
                className="w-full px-4 py-2 text-left text-sm text-orient-blue hover:bg-blue-50 border-b border-gray-100"
              >
                + Create new client
              </button>

              {/* Client list */}
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleClientSelect(client)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {client.name}
                    </div>
                    {client.email && (
                      <div className="text-xs text-gray-500">
                        {client.email}
                      </div>
                    )}
                    {client.address && (
                      <div className="text-xs text-gray-500">
                        {client.address}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No clients found matching your search' : 'No clients available'}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Create Client Modal */}
      <CreateClientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}

// Create Client Modal Component
interface CreateClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (client: Client) => void
}

function CreateClientModal({ isOpen, onClose, onSuccess }: CreateClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    address: '',
    postcode: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { createClient } = useClients()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const newClient = await createClient(formData)
      if (newClient) {
        onSuccess(newClient)
        setFormData({
          name: '',
          email: '',
          contact_number: '',
          address: '',
          postcode: ''
        })
      }
    } catch (error) {
      console.error('Error creating client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Client"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Client Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
          required
          placeholder="Enter client name"
        />

        <FormField
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
          placeholder="Enter email address"
        />

        <FormField
          label="Contact Number"
          type="tel"
          value={formData.contact_number}
          onChange={(e) => handleInputChange('contact_number', e.target.value)}
          error={errors.contact_number}
          placeholder="Enter contact number"
        />

        <FormField
          label="Address"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          error={errors.address}
          placeholder="Enter address"
        />

        <FormField
          label="Postcode"
          value={formData.postcode}
          onChange={(e) => handleInputChange('postcode', e.target.value)}
          error={errors.postcode}
          placeholder="Enter postcode"
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            Create Client
          </Button>
        </div>
      </form>
    </Modal>
  )
}