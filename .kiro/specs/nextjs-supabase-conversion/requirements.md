# Requirements Document

## Introduction

This feature involves converting an existing HTML-based gas safety inspection system to a modern Next.js application with Supabase backend integration. The current system consists of three standalone HTML forms (Gas Safety Record, Invoice Generator, and Service & Maintenance Checklist) that need to be transformed into a cohesive web application with user authentication, data persistence, and improved user experience.

## Requirements

### Requirement 1

**User Story:** As a gas engineer, I want to authenticate securely into the system, so that I can access my inspection data and maintain client confidentiality.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL display a login/signup interface
2. WHEN a user provides valid credentials THEN the system SHALL authenticate them using Supabase Auth
3. WHEN a user is authenticated THEN the system SHALL redirect them to the main dashboard
4. WHEN a user logs out THEN the system SHALL clear their session and redirect to login
5. IF a user is not authenticated THEN the system SHALL prevent access to protected routes

### Requirement 2

**User Story:** As a gas engineer, I want to create and save gas safety records, so that I can maintain digital records of all inspections and retrieve them later.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the gas safety record form THEN the system SHALL display all form fields from the original HTML version
2. WHEN a user fills out the gas safety record form THEN the system SHALL save the data to Supabase database
3. WHEN a user saves a gas safety record THEN the system SHALL generate a unique record ID
4. WHEN a user wants to view previous records THEN the system SHALL display a list of all their saved gas safety records
5. WHEN a user selects a saved record THEN the system SHALL populate the form with the saved data
6. WHEN a user updates an existing record THEN the system SHALL save the changes to the database

### Requirement 3

**User Story:** As a gas engineer, I want to generate and manage invoices, so that I can bill clients for my services and maintain financial records.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the invoice generator THEN the system SHALL display all invoice fields from the original HTML version
2. WHEN a user creates an invoice THEN the system SHALL save it to Supabase database
3. WHEN a user saves an invoice THEN the system SHALL auto-generate a unique invoice number
4. WHEN a user wants to view previous invoices THEN the system SHALL display a list of all their saved invoices
5. WHEN a user selects a saved invoice THEN the system SHALL populate the form with the saved data
6. WHEN a user updates an existing invoice THEN the system SHALL save the changes to the database

### Requirement 4

**User Story:** As a gas engineer, I want to create and save service & maintenance checklists, so that I can document detailed maintenance procedures and track service history.

#### Acceptance Criteria

1. WHEN an authenticated user accesses the service checklist form THEN the system SHALL display all form fields from the original HTML version
2. WHEN a user fills out the service checklist THEN the system SHALL save the data to Supabase database
3. WHEN a user saves a service checklist THEN the system SHALL generate a unique checklist ID
4. WHEN a user wants to view previous checklists THEN the system SHALL display a list of all their saved checklists
5. WHEN a user selects a saved checklist THEN the system SHALL populate the form with the saved data
6. WHEN a user updates an existing checklist THEN the system SHALL save the changes to the database

### Requirement 5

**User Story:** As a gas engineer, I want a dashboard to manage all my records, so that I can easily navigate between different types of documents and see recent activity.

#### Acceptance Criteria

1. WHEN an authenticated user logs in THEN the system SHALL display a dashboard with navigation to all form types
2. WHEN a user is on the dashboard THEN the system SHALL show recent records from all document types
3. WHEN a user clicks on a document type THEN the system SHALL navigate to the appropriate form or list view
4. WHEN a user wants to create a new document THEN the system SHALL provide quick access buttons from the dashboard
5. WHEN a user views the dashboard THEN the system SHALL display summary statistics of their records

### Requirement 6

**User Story:** As a gas engineer, I want to print or export my documents as PDFs, so that I can provide physical copies to clients and maintain offline records.

#### Acceptance Criteria

1. WHEN a user views any saved document THEN the system SHALL provide a print/PDF export option
2. WHEN a user clicks print/export THEN the system SHALL format the document for optimal printing
3. WHEN printing a document THEN the system SHALL hide UI elements like buttons and navigation
4. WHEN exporting to PDF THEN the system SHALL maintain the original styling and layout
5. WHEN printing any document THEN the system SHALL ensure all form data is clearly visible

### Requirement 7

**User Story:** As a gas engineer, I want my data to be automatically saved as I work, so that I don't lose progress if something unexpected happens.

#### Acceptance Criteria

1. WHEN a user is filling out any form THEN the system SHALL auto-save changes every 30 seconds
2. WHEN a user navigates away from a form with unsaved changes THEN the system SHALL prompt them to save
3. WHEN a user returns to a partially completed form THEN the system SHALL restore their previous progress
4. WHEN auto-save occurs THEN the system SHALL provide visual feedback to the user
5. IF the internet connection is lost THEN the system SHALL store changes locally and sync when reconnected

### Requirement 8

**User Story:** As a gas engineer, I want to manage client information, so that I can quickly populate forms with existing client details and maintain a client database.

#### Acceptance Criteria

1. WHEN a user creates a new record THEN the system SHALL allow them to select from existing clients or create new ones
2. WHEN a user selects an existing client THEN the system SHALL auto-populate relevant client fields
3. WHEN a user creates a new client THEN the system SHALL save the client information for future use
4. WHEN a user views their client list THEN the system SHALL display all clients with their contact information
5. WHEN a user updates client information THEN the system SHALL update it across all related records