import { supabase, supabaseClient } from './supabase'
import type { 
  Client, 
  GasSafetyRecord, 
  Invoice, 
  ServiceChecklist, 
  FormDraft,
  UserProfile 
} from '@/types'

// Client operations
export const clientOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name')
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseClient
      .from('clients')
      .insert(client)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Client>) {
    const { data, error } = await supabaseClient
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('clients')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Gas Safety Record operations
export const gasSafetyOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabaseClient
      .from('gas_safety_records')
      .select(`
        *,
        client:clients(name, address, postcode)
      `)
      .eq('user_id', userId)
      .order('record_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('gas_safety_records')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(record: Omit<GasSafetyRecord, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseClient
      .from('gas_safety_records')
      .insert(record)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<GasSafetyRecord>) {
    const { data, error } = await supabaseClient
      .from('gas_safety_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('gas_safety_records')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Invoice operations
export const invoiceOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        client:clients(name, address, postcode)
      `)
      .eq('user_id', userId)
      .order('invoice_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseClient
      .from('invoices')
      .insert(invoice)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabaseClient
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('invoices')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Service Checklist operations
export const serviceChecklistOperations = {
  async getAll(userId: string) {
    const { data, error } = await supabaseClient
      .from('service_checklists')
      .select(`
        *,
        client:clients(name, address, postcode)
      `)
      .eq('user_id', userId)
      .order('completion_date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabaseClient
      .from('service_checklists')
      .select(`
        *,
        client:clients(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(checklist: Omit<ServiceChecklist, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabaseClient
      .from('service_checklists')
      .insert(checklist)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<ServiceChecklist>) {
    const { data, error } = await supabaseClient
      .from('service_checklists')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id: string) {
    const { error } = await supabaseClient
      .from('service_checklists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Form Draft operations (for auto-save)
export const formDraftOperations = {
  async get(userId: string, formType: FormDraft['form_type']) {
    const { data, error } = await supabaseClient
      .from('form_drafts')
      .select('*')
      .eq('user_id', userId)
      .eq('form_type', formType)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error // PGRST116 is "not found"
    return data
  },

  async save(userId: string, formType: FormDraft['form_type'], formData: Record<string, any>) {
    const { data, error } = await supabaseClient
      .from('form_drafts')
      .upsert({
        user_id: userId,
        form_type: formType,
        form_data: formData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(userId: string, formType: FormDraft['form_type']) {
    const { error } = await supabaseClient
      .from('form_drafts')
      .delete()
      .eq('user_id', userId)
      .eq('form_type', formType)
    
    if (error) throw error
  }
}

// Profile operations
export const profileOperations = {
  async get(userId: string) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async update(userId: string, updates: Partial<UserProfile>) {
    const { data, error } = await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Storage operations
export const storageOperations = {
  async uploadSignature(userId: string, file: File, filename: string) {
    const filePath = `${userId}/${filename}`
    
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('signatures')
      .getPublicUrl(filePath)
    
    return { path: data.path, publicUrl }
  },

  async uploadLogo(userId: string, file: File, filename: string) {
    const filePath = `${userId}/${filename}`
    
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) throw error
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(filePath)
    
    return { path: data.path, publicUrl }
  },

  async deleteFile(bucket: 'signatures' | 'logos', filePath: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])
    
    if (error) throw error
  }
}