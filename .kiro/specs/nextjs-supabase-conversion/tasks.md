# Implementation Plan

- [x] 1. Set up Next.js project structure and core dependencies
  - Initialize Next.js 14 project with TypeScript and App Router
  - Install and configure Tailwind CSS for styling
  - Install Supabase client SDK and authentication dependencies
  - Set up project folder structure according to design specifications
  - Configure environment variables for Supabase connection
  - _Requirements: 1.1, 1.2_

- [x] 2. Configure Supabase backend and database schema
  - Create Supabase project and configure authentication settings
  - Implement database schema with all required tables (profiles, clients, gas_safety_records, invoices, service_checklists, form_drafts)
  - Set up Row Level Security (RLS) policies for data protection
  - Configure Supabase Storage bucket for signature and logo uploads
  - Create database indexes for performance optimization
  - _Requirements: 2.1, 3.1, 4.1, 8.1_

- [x] 3. Implement authentication system and user management
  - Create authentication context provider for global auth state
  - Build login page with email/password authentication
  - Build signup page with user profile creation
  - Implement AuthGuard component for route protection
  - Create user profile management page
  - Add logout functionality and session management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Build core UI components and layout system
  - Create reusable FormField component with validation
  - Build responsive Header component with navigation and user menu
  - Implement Sidebar navigation component
  - Create DataTable component for listing records
  - Build Dashboard layout with navigation cards
  - Implement PrintLayout wrapper for PDF-optimized printing
  - _Requirements: 5.1, 5.2, 5.3, 6.3_

- [x] 5. Implement client management system
  - Create Client data model and TypeScript interfaces
  - Build ClientSelector component with search and create functionality
  - Implement client CRUD operations with Supabase integration
  - Create clients list page with add/edit/delete functionality
  - Add client context provider for global client state
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 6. Build Gas Safety Record form and functionality
  - Create GasSafetyRecord TypeScript interfaces and data models
  - Build comprehensive gas safety record form component
  - Implement dynamic appliance and inspection detail rows with add/remove functionality
  - Add form validation using React Hook Form and Zod schemas
  - Integrate client selection and auto-population of client details
  - Create gas safety records list page with search and filter capabilities
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 7. Implement Invoice generation system
  - Create Invoice TypeScript interfaces and data models
  - Build invoice form component with line item management
  - Implement automatic invoice number generation
  - Add real-time calculation of subtotals, VAT, and grand totals
  - Create invoices list page with status tracking
  - Integrate client selection and billing details auto-population
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 8. Build Service & Maintenance Checklist functionality
  - Create ServiceChecklist TypeScript interfaces and data models
  - Build comprehensive service checklist form component
  - Implement checklist items with Pass/Fail/N/A options
  - Add metrics input fields for technical measurements
  - Create service checklists list page with filtering options
  - Integrate client selection and site details auto-population
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 9. Implement auto-save functionality and form state management
  - Create FormContext provider for managing form state
  - Build useAutoSave custom hook with 30-second intervals
  - Implement form drafts storage in Supabase
  - Add visual indicators for auto-save status and last saved time
  - Create unsaved changes warning when navigating away
  - Implement draft restoration when returning to forms
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Build dashboard with navigation and recent records
  - Create main dashboard page with navigation cards
  - Implement recent records display for all document types
  - Add summary statistics widgets (total records, recent activity)
  - Create quick action buttons for creating new documents
  - Implement responsive design for mobile and tablet views
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Implement print and PDF export functionality
  - Create print-optimized CSS styles for all form types
  - Implement print button functionality with window.print()
  - Hide UI elements (buttons, navigation) in print mode
  - Ensure form data visibility and proper formatting in print layout
  - Test print functionality across different browsers
  - Add print preview functionality
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 12. Add signature upload and image handling
  - Configure Supabase Storage for signature and logo uploads
  - Create signature upload component with drag-and-drop functionality
  - Implement image preview and validation
  - Add signature display in forms and print layouts
  - Create image optimization and compression utilities
  - _Requirements: 2.6, 4.6_

- [x] 13. Implement error handling and validation
  - Create global error boundary component
  - Add form validation with real-time feedback
  - Implement network error handling with retry mechanisms
  - Create user-friendly error messages and notifications
  - Add loading states for all async operations
  - _Requirements: All requirements - error handling is cross-cutting_

- [ ] 14. Add comprehensive testing suite
  - Set up Jest and React Testing Library for unit tests
  - Write component tests for all major UI components
  - Create integration tests for form submission flows
  - Add authentication flow testing
  - Implement database operation tests with Supabase mocking
  - _Requirements: All requirements - testing ensures reliability_

- [x] 15. Optimize performance and implement caching
  - Add code splitting with Next.js dynamic imports
  - Implement image optimization with Next.js Image component
  - Add pagination for large record lists
  - Implement optimistic updates for better user experience
  - Add client-side caching for user profile and clients data
  - _Requirements: 2.4, 3.4, 4.4 - performance for list views_

- [ ] 16. Deploy application and configure production environment
  - Set up Vercel deployment for Next.js application
  - Configure production Supabase environment
  - Set up environment variables for production
  - Configure custom domain and SSL certificates
  - Implement monitoring and error tracking
  - _Requirements: All requirements - deployment enables user access_