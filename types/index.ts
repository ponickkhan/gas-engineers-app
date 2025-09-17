// Type definitions for the application

export interface UserProfile {
  id: string;
  company_name?: string;
  gas_safe_reg_no?: string;
  address?: string;
  postcode?: string;
  contact_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  postcode?: string;
  contact_number?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface ContactDetails {
  name?: string;
  address?: string;
  city?: string;
  postcode?: string;
  contact_number?: string;
  email?: string;
}

export interface Appliance {
  location: string;
  type: string;
  manufacturer?: string;
  model?: string;
  owned_by_landlord?: string;
  appliance_inspected?: string;
  flue_type?: string;
}

export interface InspectionDetail {
  operating_pressure?: string;
  safety_devices?: string;
  ventilation?: string;
  flue_condition?: string;
  flue_operation?: string;
  combustion_reading?: string;
  appliance_serviced?: string;
  safe_to_use?: string;
  visual_inspection_only?: string;
}

export interface FinalCheckResults {
  gas_tightness_test?: string;
  protective_bonding?: string;
  emergency_control?: string;
  pipework_inspection?: string;
  co_alarm?: string;
  smoke_alarm?: string;
  notes?: string;
}

export interface DefectRemedial {
  defects_identified?: string;
  remedial_work?: string;
  label_warning?: string;
  co_low?: string;
  co2_ratio_low?: string;
  co_high?: string;
  co2_ratio_high?: string;
}

export interface GasSafetyRecord {
  id: string;
  user_id: string;
  client_id?: string;
  record_date: string;
  reference_number?: string;
  serial_number?: string;
  landlord_details?: ContactDetails;
  site_details?: ContactDetails;
  appliances: Appliance[];
  inspection_details: InspectionDetail[];
  final_check_results?: FinalCheckResults;
  defects_remedial: DefectRemedial[];
  next_inspection_date?: string;
  engineer_signature?: string;
  engineer_name?: string;
  gas_safe_licence?: string;
  received_by_signature?: string;
  received_by_name?: string;
  received_by_position?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  reference_po?: string;
  bill_to_details?: ContactDetails;
  line_items: InvoiceLineItem[];
  subtotal: number;
  vat_total: number;
  grand_total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid';
  created_at: string;
  updated_at: string;
}

export interface ApplianceDetails {
  location?: string;
  owned_by_landlord?: string;
  type?: string;
  model?: string;
  flue_type?: string;
  manufacturer?: string;
  serial_no?: string;
}

export interface ChecklistItem {
  item: string;
  pass?: string;
  fail?: string;
  na?: string;
  comments?: string;
}

export interface SafetySummary {
  safe_to_use?: string;
  giusp_classification?: string;
  warning_notice?: string;
}

export interface ServiceChecklist {
  id: string;
  user_id: string;
  client_id?: string;
  site_details?: ContactDetails;
  appliance_details?: ApplianceDetails;
  installation_checks?: Record<string, string>;
  appliance_checks?: Record<string, any>;
  safety_summary?: SafetySummary;
  completion_date?: string;
  next_service_date?: string;
  engineer_signature?: string;
  engineer_name?: string;
  engineer_licence?: string;
  client_signature?: string;
  client_name?: string;
  client_position?: string;
  created_at: string;
  updated_at: string;
}

export interface FormDraft {
  id: string;
  user_id: string;
  form_type: 'gas_safety' | 'invoice' | 'service_checklist';
  form_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>;
      };
      clients: {
        Row: Client;
        Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      gas_safety_records: {
        Row: GasSafetyRecord;
        Insert: Omit<GasSafetyRecord, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<GasSafetyRecord, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      invoices: {
        Row: Invoice;
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Invoice, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      service_checklists: {
        Row: ServiceChecklist;
        Insert: Omit<ServiceChecklist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ServiceChecklist, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
      form_drafts: {
        Row: FormDraft;
        Insert: Omit<FormDraft, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<FormDraft, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}