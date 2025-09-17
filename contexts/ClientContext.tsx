'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Client } from '@/types'
import { useAuth } from './AuthContext'
import { supabase, supabaseClient } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toast'

interface ClientContextType {
  clients: Client[]
  selectedClient: Client | null
  loading: boolean
  error: string | null
  fetchClients: () => Promise<void>
  createClient: (clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Client | null>
  updateClient: (id: string, clientData: Partial<Client>) => Promise<Client | null>
  deleteClient: (id: string) => Promise<boolean>
  selectClient: (client: Client | null) => void
  getClientById: (id: string) => Client | undefined
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function useClients() {
  const context = useContext(ClientContext)
  if (!context) {
    throw new Error('useClients must be used within a ClientProvider')
  }
  return context
}

interface ClientProviderProps {
  children: ReactNode
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { addToast } = useToast()

  const fetchClients = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseClient
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error

      setClients(data || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch clients'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error fetching clients',
        message: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }, [user, addToast])

  const createClient = useCallback(async (
    clientData: Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<Client | null> => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseClient
        .from('clients')
        .insert({
          ...clientData,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      const newClient = data as Client
      setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)))
      
      addToast({
        type: 'success',
        title: 'Client created',
        message: `${newClient.name} has been added successfully`
      })

      return newClient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create client'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error creating client',
        message: errorMessage
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, addToast])

  const updateClient = useCallback(async (
    id: string, 
    clientData: Partial<Client>
  ): Promise<Client | null> => {
    if (!user) return null

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabaseClient
        .from('clients')
        .update(clientData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      const updatedClient = data as Client
      setClients(prev => 
        prev.map(client => 
          client.id === id ? updatedClient : client
        ).sort((a, b) => a.name.localeCompare(b.name))
      )

      // Update selected client if it's the one being updated
      if (selectedClient?.id === id) {
        setSelectedClient(updatedClient)
      }

      addToast({
        type: 'success',
        title: 'Client updated',
        message: `${updatedClient.name} has been updated successfully`
      })

      return updatedClient
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update client'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error updating client',
        message: errorMessage
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [user, selectedClient, addToast])

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabaseClient
        .from('clients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      setClients(prev => prev.filter(client => client.id !== id))

      // Clear selected client if it's the one being deleted
      if (selectedClient?.id === id) {
        setSelectedClient(null)
      }

      addToast({
        type: 'success',
        title: 'Client deleted',
        message: 'Client has been deleted successfully'
      })

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete client'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error deleting client',
        message: errorMessage
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [user, selectedClient, addToast])

  const selectClient = useCallback((client: Client | null) => {
    setSelectedClient(client)
  }, [])

  const getClientById = useCallback((id: string): Client | undefined => {
    return clients.find(client => client.id === id)
  }, [clients])

  // Fetch clients when user changes
  useEffect(() => {
    if (user) {
      fetchClients()
    } else {
      setClients([])
      setSelectedClient(null)
    }
  }, [user, fetchClients])

  const value: ClientContextType = {
    clients,
    selectedClient,
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
    selectClient,
    getClientById
  }

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  )
}