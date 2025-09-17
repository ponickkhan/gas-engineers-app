# Design Document

## Overview

This design outlines the conversion of a static HTML gas safety inspection system into a modern Next.js application with Supabase backend. The application will maintain the existing functionality while adding user authentication, data persistence, and improved user experience through a single-page application architecture.

## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS for utility-first styling, maintaining the existing visual design
- **State Management**: React Context API for global state (user session, form data)
- **Form Handling**: React Hook Form for form validation and management
- **UI Components**: Custom components built with Tailwind, maintaining the existing design system

### Backend Architecture
- **Database**: Supabase PostgreSQL database
- **Authentication**: Supabase Auth with email/password authentication
- **API**: Supabase client-side SDK for database operations
- **Real-time**: Supabase real-time subscriptions for auto-save functionality
- **Storage**: Supabase Storage for file uploads (signatures, logos)

### Database Schema
```sql
-- Users table (managed by Supabase Auth)
-- Additional user profile data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  company_name TEXT,
  gas_safe_reg_no TEXT,
  address TEXT,
  postcode TEXT,
  contact_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  postcode TEXT,
  contact_number TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gas Safety Records
CREATE TABLE gas_safety_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  record_date DATE NOT NULL,
  reference_number TEXT,
  serial_number TEXT,
  landlord_details JSONB,
  site_details JSONB,
  appliances JSONB[], -- Array of appliance objects
  inspection_details JSONB[], -- Array of inspection objects
  final_check_results JSONB,
  defects_remedial JSONB[], -- Array of defects/remedial objects
  next_inspection_date DATE,
  engineer_signature TEXT, -- URL to signature image
  engineer_name TEXT,
  gas_safe_licence TEXT,
  received_by_signature TEXT, -- URL to signature image
  received_by_name TEXT,
  received_by_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  reference_po TEXT,
  bill_to_details JSONB,
  line_items JSONB[], -- Array of invoice line items
  subtotal DECIMAL(10,2),
  vat_total DECIMAL(10,2),
  grand_total DECIMAL(10,2),
  notes TEXT,
  status TEXT DEFAULT 'draft', -- draft, sent, paid
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Checklists
CREATE TABLE service_checklists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  site_details JSONB,
  appliance_details JSONB,
  installation_checks JSONB,
  appliance_checks JSONB,
  safety_summary JSONB,
  completion_date DATE,
  next_service_date DATE,
  engineer_signature TEXT, -- URL to signature image
  engineer_name TEXT,
  engineer_licence TEXT,
  client_signature TEXT, -- URL to signature image
  client_name TEXT,
  client_position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-save drafts
CREATE TABLE form_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  form_type TEXT NOT NULL, -- 'gas_safety', 'invoice', 'service_checklist'
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, form_type)
);
```

## Components and Interfaces

### Page Structure
```
/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   ├── gas-safety/
│   │   ├── page.tsx (list view)
│   │   ├── new/
│   │   └── [id]/
│   ├── invoices/
│   │   ├── page.tsx (list view)
│   │   ├── new/
│   │   └── [id]/
│   ├── service-checklist/
│   │   ├── page.tsx (list view)
│   │   ├── new/
│   │   └── [id]/
│   ├── clients/
│   └── profile/
```

### Key Components

#### Authentication Components
- `LoginForm`: Email/password login with Supabase Auth
- `SignupForm`: User registration with profile setup
- `AuthGuard`: HOC for protecting routes
- `UserProfile`: Profile management component

#### Form Components
- `GasSafetyRecordForm`: Main gas safety inspection form
- `InvoiceForm`: Invoice generation form
- `ServiceChecklistForm`: Service and maintenance checklist form
- `ClientSelector`: Dropdown/search for selecting existing clients
- `AutoSaveIndicator`: Visual feedback for auto-save status

#### UI Components
- `FormField`: Reusable form input wrapper
- `DataTable`: Reusable table for listing records
- `PrintLayout`: Print-optimized layout wrapper
- `Dashboard`: Main dashboard with navigation and recent records
- `Sidebar`: Navigation sidebar
- `Header`: Top navigation with user menu

#### Data Management Components
- `FormAutoSave`: Hook for automatic form saving
- `ClientManager`: Client CRUD operations
- `RecordsList`: Generic list component for all record types

### State Management

#### Context Providers
```typescript
// AuthContext - User authentication state
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: UserProfile) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

// FormContext - Form state and auto-save
interface FormContextType {
  formData: any;
  updateFormData: (data: any) => void;
  saveForm: () => Promise<void>;
  autoSaveEnabled: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
}

// ClientContext - Client management
interface ClientContextType {
  clients: Client[];
  selectedClient: Client | null;
  selectClient: (client: Client) => void;
  createClient: (client: Omit<Client, 'id'>) => Promise<Client>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
}
```

## Data Models

### TypeScript Interfaces
```typescript
interface UserProfile {
  id: string;
  company_name?: string;
  gas_safe_reg_no?: string;
  address?: string;
  postcode?: string;
  contact_number?: string;
}

interface Client {
  id: string;
  user_id: string;
  name: string;
  address?: string;
  postcode?: string;
  contact_number?: string;
  email?: string;
}

interface GasSafetyRecord {
  id: string;
  user_id: string;
  client_id?: string;
  record_date: string;
  reference_number?: string;
  serial_number?: string;
  landlord_details: ContactDetails;
  site_details: ContactDetails;
  appliances: Appliance[];
  inspection_details: InspectionDetail[];
  final_check_results: FinalCheckResults;
  defects_remedial: DefectRemedial[];
  next_inspection_date: string;
  engineer_signature?: string;
  engineer_name?: string;
  gas_safe_licence?: string;
  received_by_signature?: string;
  received_by_name?: string;
  received_by_position?: string;
}

interface Invoice {
  id: string;
  user_id: string;
  client_id?: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  reference_po?: string;
  bill_to_details: ContactDetails;
  line_items: InvoiceLineItem[];
  subtotal: number;
  vat_total: number;
  grand_total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'paid';
}

interface ServiceChecklist {
  id: string;
  user_id: string;
  client_id?: string;
  site_details: ContactDetails;
  appliance_details: ApplianceDetails;
  installation_checks: ChecklistItem[];
  appliance_checks: ChecklistItem[];
  safety_summary: SafetySummary;
  completion_date: string;
  next_service_date: string;
  engineer_signature?: string;
  engineer_name?: string;
  engineer_licence?: string;
  client_signature?: string;
  client_name?: string;
  client_position?: string;
}
```

## Error Handling

### Error Boundaries
- Global error boundary for unhandled React errors
- Form-specific error boundaries for form validation errors
- Network error handling with retry mechanisms

### Validation Strategy
- Client-side validation using React Hook Form with Zod schemas
- Server-side validation through Supabase RLS policies
- Real-time validation feedback for form fields

### Error Types
```typescript
enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  PERMISSION = 'permission',
  SERVER = 'server'
}

interface AppError {
  type: ErrorType;
  message: string;
  field?: string;
  code?: string;
}
```

## Testing Strategy

### Unit Testing
- Component testing with React Testing Library
- Hook testing for custom hooks (useAutoSave, useAuth)
- Utility function testing with Jest

### Integration Testing
- Form submission flows
- Authentication flows
- Database operations with Supabase

### End-to-End Testing
- Complete user workflows (login → create record → save → print)
- Cross-browser compatibility testing
- Mobile responsiveness testing

### Test Structure
```
tests/
├── __mocks__/
│   └── supabase.ts
├── components/
├── hooks/
├── pages/
├── utils/
└── e2e/
    ├── auth.spec.ts
    ├── gas-safety.spec.ts
    ├── invoices.spec.ts
    └── service-checklist.spec.ts
```

## Security Considerations

### Authentication & Authorization
- Supabase Auth handles secure authentication
- Row Level Security (RLS) policies ensure users only access their own data
- JWT tokens for API authentication

### Data Protection
- All sensitive data encrypted at rest in Supabase
- HTTPS enforcement for all communications
- Input sanitization to prevent XSS attacks

### RLS Policies
```sql
-- Users can only access their own records
CREATE POLICY "Users can view own gas safety records" ON gas_safety_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gas safety records" ON gas_safety_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gas safety records" ON gas_safety_records
  FOR UPDATE USING (auth.uid() = user_id);

-- Similar policies for invoices, service_checklists, clients, and form_drafts
```

## Performance Optimization

### Frontend Optimization
- Code splitting with Next.js dynamic imports
- Image optimization with Next.js Image component
- Lazy loading for large forms and lists
- Memoization of expensive calculations

### Backend Optimization
- Database indexing on frequently queried fields
- Pagination for large datasets
- Optimistic updates for better UX
- Connection pooling through Supabase

### Caching Strategy
- Static page caching where appropriate
- Client-side caching of user profile and clients
- Browser caching for static assets

## Migration Strategy

### Data Migration
- No existing data to migrate (new application)
- Import functionality for existing PDF/paper records (future enhancement)

### Deployment Strategy
- Vercel deployment for Next.js application
- Supabase cloud for backend services
- Environment-based configuration (development, staging, production)

### Rollout Plan
1. Deploy authentication and basic dashboard
2. Deploy gas safety record functionality
3. Deploy invoice functionality
4. Deploy service checklist functionality
5. Add advanced features (auto-save, client management)

## Accessibility

### WCAG 2.1 Compliance
- Semantic HTML structure
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance

### Form Accessibility
- Clear form labels and instructions
- Error message association with form fields
- Focus management for dynamic content
- Progress indicators for multi-step forms