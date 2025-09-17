-- Fix RLS policies to ensure proper authentication context

-- Drop existing invoice policies
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;

-- Create more explicit policies with better error handling
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert own invoices" ON invoices
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own invoices" ON invoices
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Also ensure the invoice_number unique constraint allows for user-scoped uniqueness
-- Drop the existing unique constraint if it exists
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key;

-- Create a unique constraint that's scoped to the user
CREATE UNIQUE INDEX IF NOT EXISTS invoices_user_invoice_number_unique 
ON invoices (user_id, invoice_number);