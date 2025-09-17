'use client'

import { Client } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

interface ClientCardProps {
  client: Client
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onSelect?: (client: Client) => void
  selected?: boolean
  showActions?: boolean
  className?: string
}

export function ClientCard({
  client,
  onEdit,
  onDelete,
  onSelect,
  selected = false,
  showActions = true,
  className
}: ClientCardProps) {
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        selected && "ring-2 ring-orient-blue border-orient-blue",
        onSelect && "cursor-pointer",
        className
      )}
      onClick={() => onSelect?.(client)}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {client.name}
            </h3>
            
            {client.email && (
              <p className="text-sm text-gray-600 mt-1">
                📧 {client.email}
              </p>
            )}
            
            {client.contact_number && (
              <p className="text-sm text-gray-600 mt-1">
                📞 {client.contact_number}
              </p>
            )}
            
            {client.address && (
              <div className="text-sm text-gray-600 mt-2">
                <p>📍 {client.address}</p>
                {client.postcode && (
                  <p className="ml-4">{client.postcode}</p>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-400 mt-3">
              Created: {new Date(client.created_at).toLocaleDateString()}
            </p>
          </div>
          
          {showActions && (
            <div className="flex flex-col space-y-2 ml-4">
              {onEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(client)
                  }}
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(client)
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Grid layout for multiple client cards
interface ClientGridProps {
  clients: Client[]
  onEdit?: (client: Client) => void
  onDelete?: (client: Client) => void
  onSelect?: (client: Client) => void
  selectedClient?: Client | null
  showActions?: boolean
  emptyMessage?: string
  className?: string
}

export function ClientGrid({
  clients,
  onEdit,
  onDelete,
  onSelect,
  selectedClient,
  showActions = true,
  emptyMessage = "No clients found",
  className
}: ClientGridProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      className
    )}>
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          selected={selectedClient?.id === client.id}
          showActions={showActions}
        />
      ))}
    </div>
  )
}