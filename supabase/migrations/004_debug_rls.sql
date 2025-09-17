-- Temporarily disable RLS for debugging
-- This should be reverted after fixing the authentication issue

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'invoices';

-- Temporarily disable RLS on invoices table for debugging
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- Re-enable after debugging (comment out the disable line above and uncomment this)
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;