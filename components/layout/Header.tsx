'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and main navigation */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <div className="w-8 h-8 bg-orient-blue rounded-md flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">OG</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Orient Gas Engineers
              </span>
            </Link>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-orient-blue px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/gas-safety"
              className="text-gray-700 hover:text-orient-blue px-3 py-2 rounded-md text-sm font-medium"
            >
              Gas Safety
            </Link>
            <Link
              href="/invoices"
              className="text-gray-700 hover:text-orient-blue px-3 py-2 rounded-md text-sm font-medium"
            >
              Invoices
            </Link>
            <Link
              href="/service-checklist"
              className="text-gray-700 hover:text-orient-blue px-3 py-2 rounded-md text-sm font-medium"
            >
              Service
            </Link>
            <Link
              href="/clients"
              className="text-gray-700 hover:text-orient-blue px-3 py-2 rounded-md text-sm font-medium"
            >
              Clients
            </Link>
          </nav>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orient-blue"
            >
              <div className="w-8 h-8 bg-orient-blue rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="ml-2 text-gray-700 hidden sm:block">
                {profile?.company_name || user?.email}
              </span>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.email}</div>
                  {profile?.company_name && (
                    <div className="text-gray-500">{profile.company_name}</div>
                  )}
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
          <Link
            href="/dashboard"
            className="text-gray-700 hover:text-orient-blue block px-3 py-2 rounded-md text-base font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/gas-safety"
            className="text-gray-700 hover:text-orient-blue block px-3 py-2 rounded-md text-base font-medium"
          >
            Gas Safety
          </Link>
          <Link
            href="/invoices"
            className="text-gray-700 hover:text-orient-blue block px-3 py-2 rounded-md text-base font-medium"
          >
            Invoices
          </Link>
          <Link
            href="/service-checklist"
            className="text-gray-700 hover:text-orient-blue block px-3 py-2 rounded-md text-base font-medium"
          >
            Service
          </Link>
          <Link
            href="/clients"
            className="text-gray-700 hover:text-orient-blue block px-3 py-2 rounded-md text-base font-medium"
          >
            Clients
          </Link>
        </div>
      </div>
    </header>
  )
}