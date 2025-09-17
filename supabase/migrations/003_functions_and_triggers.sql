-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, company_name, gas_safe_reg_no)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'gas_safe_reg_no', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  current_month TEXT;
  current_day TEXT;
  random_suffix TEXT;
  invoice_number TEXT;
  counter INTEGER := 0;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  current_month := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
  current_day := LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0');
  
  LOOP
    random_suffix := LPAD((RANDOM() * 999)::INTEGER::TEXT, 3, '0');
    invoice_number := 'OGE-' || current_year || current_month || current_day || '-' || random_suffix;
    
    -- Check if this invoice number already exists
    IF NOT EXISTS (SELECT 1 FROM invoices WHERE invoice_number = invoice_number) THEN
      RETURN invoice_number;
    END IF;
    
    counter := counter + 1;
    -- Prevent infinite loop
    IF counter > 1000 THEN
      RAISE EXCEPTION 'Unable to generate unique invoice number after 1000 attempts';
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate invoice number on insert
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set invoice number before insert
CREATE TRIGGER set_invoice_number_trigger
  BEFORE INSERT ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_invoice_number();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  line_subtotal DECIMAL(10,2);
  line_vat DECIMAL(10,2);
  total_subtotal DECIMAL(10,2) := 0;
  total_vat DECIMAL(10,2) := 0;
BEGIN
  -- Calculate totals from line items
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.line_items)
  LOOP
    line_subtotal := (item->>'quantity')::DECIMAL * (item->>'unit_price')::DECIMAL;
    line_vat := line_subtotal * ((item->>'vat_rate')::DECIMAL / 100);
    
    total_subtotal := total_subtotal + line_subtotal;
    total_vat := total_vat + line_vat;
  END LOOP;
  
  NEW.subtotal := total_subtotal;
  NEW.vat_total := total_vat;
  NEW.grand_total := total_subtotal + total_vat;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to calculate invoice totals on insert/update
CREATE TRIGGER calculate_invoice_totals_trigger
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Function to clean up old form drafts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_drafts()
RETURNS void AS $$
BEGIN
  DELETE FROM form_drafts 
  WHERE updated_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up old drafts (requires pg_cron extension)
-- This would be set up in Supabase dashboard or via SQL editor
-- SELECT cron.schedule('cleanup-old-drafts', '0 2 * * *', 'SELECT cleanup_old_drafts();');