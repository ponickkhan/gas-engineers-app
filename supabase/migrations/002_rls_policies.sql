-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gas_safety_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clients policies
CREATE POLICY "Users can view own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Gas Safety Records policies
CREATE POLICY "Users can view own gas safety records" ON gas_safety_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gas safety records" ON gas_safety_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gas safety records" ON gas_safety_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gas safety records" ON gas_safety_records
  FOR DELETE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Service Checklists policies
CREATE POLICY "Users can view own service checklists" ON service_checklists
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own service checklists" ON service_checklists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own service checklists" ON service_checklists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own service checklists" ON service_checklists
  FOR DELETE USING (auth.uid() = user_id);

-- Form Drafts policies
CREATE POLICY "Users can view own form drafts" ON form_drafts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own form drafts" ON form_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own form drafts" ON form_drafts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own form drafts" ON form_drafts
  FOR DELETE USING (auth.uid() = user_id);