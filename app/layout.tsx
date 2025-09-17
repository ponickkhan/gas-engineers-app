import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { ClientProvider } from '@/contexts/ClientContext'
import { FormProvider } from '@/contexts/FormContext'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/error/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Orient Gas Engineers - Inspection System',
  description: 'Gas safety inspection and management system for Orient Gas Engineers LTD',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ToastProvider>
            <AuthProvider>
              <ClientProvider>
                <FormProvider>
                  {children}
                </FormProvider>
              </ClientProvider>
            </AuthProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}