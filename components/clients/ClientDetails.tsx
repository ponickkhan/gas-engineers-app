'use client'

import { Client } from '@/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

interface ClientDetailsProps {
  client: Client
  onEdit?: (client: Client) => void
  onClose?: () => void
  showActions?: boolean
}

export function ClientDetails({ 
  client, 
  onEdit, 
  onClose, 
  showActions = true 
}: ClientDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{client.name}</CardTitle>
            <Badge variant="info" className="mt-2">
              Client ID: {client.id.slice(0, 8)}...
            </Badge>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(client)}
                >
                  Edit
                </Button>
              )}
              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                >
                  ✕
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
          <div className="space-y-2 text-sm">
            {client.email && (
              <div className="flex items-center">
                <span className="w-20 text-gray-500">Email:</span>
                <a 
                  href={`mailto:${client.email}`}
                  className="text-orient-blue hover:underline"
                >
                  {client.email}
                </a>
              </div>
            )}
            {client.contact_number && (
              <div className="flex items-center">
                <span className="w-20 text-gray-500">Phone:</span>
                <a 
                  href={`tel:${client.contact_number}`}
                  className="text-orient-blue hover:underline"
                >
                  {client.contact_number}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        {(client.address || client.postcode) && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Address</h4>
            <div className="text-sm text-gray-700">
              {client.address && (
                <div>{client.address}</div>
              )}
              {client.postcode && (
                <div className="font-medium">{client.postcode}</div>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Record Information</h4>
          <div className="space-y-1 text-sm text-gray-500">
            <div>
              Created: {new Date(client.created_at).toLocaleString()}
            </div>
            <div>
              Last Updated: {new Date(client.updated_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Navigate to create gas safety record for this client
                console.log('Create gas safety record for', client.name)
              }}
            >
              🔥 Gas Safety Record
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Navigate to create invoice for this client
                console.log('Create invoice for', client.name)
              }}
            >
              💰 New Invoice
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start"
              onClick={() => {
                // TODO: Navigate to create service checklist for this client
                console.log('Create service checklist for', client.name)
              }}
            >
              ✅ Service Checklist
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for use in sidebars or smaller spaces
interface ClientSummaryProps {
  client: Client
  className?: string
}

export function ClientSummary({ client, className }: ClientSummaryProps) {
  return (
    <div className={className}>
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-orient-blue rounded-full flex items-center justify-center text-white font-medium">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {client.name}
          </p>
          {client.email && (
            <p className="text-xs text-gray-500 truncate">
              {client.email}
            </p>
          )}
          {client.contact_number && (
            <p className="text-xs text-gray-500">
              {client.contact_number}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}