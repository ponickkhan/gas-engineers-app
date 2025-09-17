'use client'

import React, { useState } from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { DataTable, formatDate } from '@/components/ui/DataTable'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { FormField } from '@/components/ui/FormField'
import { useClients } from '@/contexts/ClientContext'
import { Client } from '@/types'

function ClientsContent() {
  const { clients, loading, createClient, updateClient, deleteClient } = useClients()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deletingClient, setDeletingClient] = useState<Client | null>(null)

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (client: Client) => (
        <div>
          <div className="font-medium text-gray-900">{client.name}</div>
          {client.email && (
            <div className="text-sm text-gray-500">{client.email}</div>
          )}
        </div>
      )
    },
    {
      key: 'contact_number',
      header: 'Contact',
      render: (client: Client) => client.contact_number || '-'
    },
    {
      key: 'address',
      header: 'Address',
      render: (client: Client) => (
        <div>
          {client.address && (
            <div className="text-sm text-gray-900">{client.address}</div>
          )}
          {client.postcode && (
            <div className="text-sm text-gray-500">{client.postcode}</div>
          )}
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (client: Client) => formatDate(client.created_at)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client: Client) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingClient(client)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => setDeletingClient(client)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ]

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
  }

  const handleEditSuccess = () => {
    setEditingClient(null)
  }

  const handleDeleteConfirm = async () => {
    if (deletingClient) {
      const success = await deleteClient(deletingClient.id)
      if (success) {
        setDeletingClient(null)
      }
    }
  }

  return (
    <DashboardLayout
      title="Clients"
      actions={
        <Button onClick={() => setShowCreateModal(true)}>
          + Add Client
        </Button>
      }
    >
      <div className="space-y-6">
        <DataTable
          data={clients}
          columns={columns}
          loading={loading}
          emptyMessage="No clients found. Create your first client to get started."
        />
      </div>

      {/* Create Client Modal */}
      <ClientFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        title="Create New Client"
      />

      {/* Edit Client Modal */}
      <ClientFormModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={handleEditSuccess}
        client={editingClient}
        title="Edit Client"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Client"
        message={`Are you sure you want to delete "${deletingClient?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </DashboardLayout>
  )
}

// Client Form Modal Component
interface ClientFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client?: Client | null
  title: string
}

function ClientFormModal({ isOpen, onClose, onSuccess, client, title }: ClientFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact_number: '',
    address: '',
    postcode: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { createClient, updateClient } = useClients()

  // Initialize form data when client changes
  React.useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        contact_number: client.contact_number || '',
        address: client.address || '',
        postcode: client.postcode || ''
      })
    } else {
      setFormData({
        name: '',
        email: '',
        contact_number: '',
        address: '',
        postcode: ''
      })
    }
    setErrors({})
  }, [client])

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
      let success = false
      
      if (client) {
        // Update existing client
        const updatedClient = await updateClient(client.id, formData)
        success = !!updatedClient
      } else {
        // Create new client
        const newClient = await createClient(formData)
        success = !!newClient
      }

      if (success) {
        onSuccess()
      }
    } catch (error) {
      console.error('Error saving client:', error)
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
      title={title}
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
            {client ? 'Update Client' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function ClientsPage() {
  return (
    <AuthGuard>
      <ClientsContent />
    </AuthGuard>
  )
}