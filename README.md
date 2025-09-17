# Orient Gas Engineers - Inspection System

A modern Next.js application for gas safety inspections, invoicing, and service management.

## Features

- 🔐 User authentication with Supabase Auth
- 📋 Gas Safety Record management
- 💰 Invoice generation and tracking
- ✅ Service & Maintenance Checklists
- 👥 Client management
- 💾 Auto-save functionality
- 🖨️ Print/PDF export
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

4. Update `.env.local` with your Supabase credentials

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setup Supabase

1. Create a new Supabase project
2. Run the database schema from the design document
3. Configure Row Level Security policies
4. Set up authentication providers
5. Create a storage bucket for signatures/logos

## Project Structure

```
├── app/                    # Next.js 14 App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── gas-safety/        # Gas safety records
│   ├── invoices/          # Invoice management
│   ├── service-checklist/ # Service checklists
│   ├── clients/           # Client management
│   └── profile/           # User profile
├── components/            # React components
├── lib/                   # Utility libraries
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
└── public/               # Static assets
```

## Development

This project uses:
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Supabase** for backend services
- **React Hook Form** for form management
- **Zod** for validation

## License

Private - Orient Gas Engineers LTD