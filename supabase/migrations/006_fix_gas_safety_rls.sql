-- Fix RLS policies for gas_safety_records to ensure proper authentication context

-- Drop existing gas safety record policies
DROP POLICY IF EXISTS "Users can view own gas safety records" ON gas_safety_records;
DROP POLICY IF EXISTS "Users can insert own gas safety records" ON gas_safety_records;
DROP POLICY IF EXISTS "Users can update own gas safety records" ON gas_safety_records;
DROP POLICY IF EXISTS "Users can delete own gas safety records" ON gas_safety_records;

-- Create more explicit policies with better error handling
CREATE POLICY "Users can view own gas safety records" ON gas_safety_records
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert own gas safety records" ON gas_safety_records
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own gas safety records" ON gas_safety_records
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own gas safety records" ON gas_safety_records
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

-- Also fix other tables that might have the same issue
-- Service checklists
DROP POLICY IF EXISTS "Users can view own service checklists" ON service_checklists;
DROP POLICY IF EXISTS "Users can insert own service checklists" ON service_checklists;
DROP POLICY IF EXISTS "Users can update own service checklists" ON service_checklists;
DROP POLICY IF EXISTS "Users can delete own service checklists" ON service_checklists;

CREATE POLICY "Users can view own service checklists" ON service_checklists
  FOR SELECT 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can insert own service checklists" ON service_checklists
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own service checklists" ON service_checklists
  FOR UPDATE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );

CREATE POLICY "Users can delete own service checklists" ON service_checklists
  FOR DELETE 
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid() = user_id
  );