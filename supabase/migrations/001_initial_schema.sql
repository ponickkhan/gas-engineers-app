-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table for additional user data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT,
  gas_safe_reg_no TEXT,
  address TEXT,
  postcode TEXT,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gas_safety_records table
CREATE TABLE gas_safety_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  record_date DATE NOT NULL,
  reference_number TEXT,
  serial_number TEXT,
  landlord_details JSONB,
  site_details JSONB,
  appliances JSONB[] DEFAULT '{}',
  inspection_details JSONB[] DEFAULT '{}',
  final_check_results JSONB,
  defects_remedial JSONB[] DEFAULT '{}',
  next_inspection_date DATE,
  engineer_signature TEXT,
  engineer_name TEXT,
  gas_safe_licence TEXT,
  received_by_signature TEXT,
  received_by_name TEXT,
  received_by_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  reference_po TEXT,
  bill_to_details JSONB,
  line_items JSONB[] DEFAULT '{}',
  subtotal DECIMAL(10,2) DEFAULT 0,
  vat_total DECIMAL(10,2) DEFAULT 0,
  grand_total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create service_checklists table
CREATE TABLE service_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  site_details JSONB,
  appliance_details JSONB,
  installation_checks JSONB,
  appliance_checks JSONB,
  safety_summary JSONB,
  completion_date DATE,
  next_service_date DATE,
  engineer_signature TEXT,
  engineer_name TEXT,
  engineer_licence TEXT,
  client_signature TEXT,
  client_name TEXT,
  client_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create form_drafts table for auto-save functionality
CREATE TABLE form_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('gas_safety', 'invoice', 'service_checklist')),
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, form_type)
);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_gas_safety_records_user_id ON gas_safety_records(user_id);
CREATE INDEX idx_gas_safety_records_client_id ON gas_safety_records(client_id);
CREATE INDEX idx_gas_safety_records_record_date ON gas_safety_records(record_date);
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_service_checklists_user_id ON service_checklists(user_id);
CREATE INDEX idx_service_checklists_client_id ON service_checklists(client_id);
CREATE INDEX idx_service_checklists_completion_date ON service_checklists(completion_date);
CREATE INDEX idx_form_drafts_user_id_form_type ON form_drafts(user_id, form_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gas_safety_records_updated_at BEFORE UPDATE ON gas_safety_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_checklists_updated_at BEFORE UPDATE ON service_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_form_drafts_updated_at BEFORE UPDATE ON form_drafts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();