# Supabase Setup Guide

This guide will help you set up Supabase for the Orient Gas Engineers application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `orient-gas-app`
   - Database Password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Settings → API
2. Copy the following values:
   - Project URL
   - Project API keys (anon/public key)
   - Service role key (keep this secret!)

## 3. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

### Option B: Manual Setup via SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_functions_and_triggers.sql`
   - `supabase/migrations/004_storage_setup.sql`

## 5. Configure Authentication

1. Go to Authentication → Settings
2. Configure the following:
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: Add your production domain when ready
   - Email templates: Customize if needed
   - Enable email confirmations: Set to false for development

## 6. Set Up Storage

The migrations will create the storage buckets, but you may want to:

1. Go to Storage in your Supabase dashboard
2. Verify that `signatures` and `logos` buckets were created
3. Check the RLS policies are in place

## 7. Test the Connection

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Try to access the application at `http://localhost:3000`
3. The authentication pages should load without errors

## 8. Optional: Seed Data

If you want to add sample data for development:

1. Go to SQL Editor in Supabase dashboard
2. Run the `supabase/seed.sql` file
3. Or create your own test data

## 9. Production Setup

When deploying to production:

1. Update environment variables with production Supabase URL
2. Add your production domain to:
   - Authentication → Settings → Site URL
   - Authentication → Settings → Redirect URLs
3. Consider enabling email confirmations
4. Set up proper backup and monitoring

## Troubleshooting

### Common Issues:

1. **RLS Policies**: Make sure Row Level Security is enabled and policies are correctly set up
2. **CORS Issues**: Ensure your domain is added to the allowed origins
3. **Storage Issues**: Check that storage buckets exist and have proper policies
4. **Migration Errors**: Run migrations in the correct order

### Useful Commands:

```bash
# Check migration status
supabase migration list

# Reset database (development only!)
supabase db reset

# Generate types
supabase gen types typescript --project-id your-project-ref > types/supabase.ts
```

## Next Steps

After completing this setup:

1. Test user registration and login
2. Verify database operations work
3. Test file uploads to storage
4. Move on to implementing the authentication system (Task 3)