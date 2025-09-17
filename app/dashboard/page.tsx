'use client'

import React from 'react'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { DashboardLayout, StatsCard, RecentActivity } from '@/components/layout/Dashboard'
import { Button } from '@/components/ui/Button'
import { LoadingCard } from '@/components/ui/LoadingSpinner'
import { useDashboard } from '@/hooks/useDashboard'
import Link from 'next/link'

function DashboardContent() {
  const { recentActivity, stats, loading, error, refetch } = useDashboard()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <LoadingCard key={i} />
            ))}
          </div>
          <div className="bg-white shadow rounded-lg animate-pulse">
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-900">
                Error Loading Dashboard
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {error}
              </p>
              <div className="mt-4">
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout 
      title="Dashboard"
      actions={
        <Button 
          variant="outline" 
          onClick={refetch}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Welcome Message for New Users */}
        {stats.totalClients === 0 && stats.totalInvoices === 0 && stats.totalGasSafety === 0 && stats.totalServiceChecklists === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl">👋</span>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Welcome to your Gas Engineer Dashboard!
                </h3>
                <p className="mt-2 text-sm text-blue-700">
                  Get started by adding your first client, then create gas safety records, invoices, and service checklists.
                </p>
                <div className="mt-4">
                  <Link href="/clients">
                    <Button size="sm">
                      Add Your First Client
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity Summary for Users with Data */}
        {(stats.totalClients > 0 || stats.totalInvoices > 0 || stats.totalGasSafety > 0 || stats.totalServiceChecklists > 0) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl">📊</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  You have <strong>{stats.totalClients}</strong> clients, 
                  <strong> {stats.totalGasSafety + stats.totalInvoices + stats.totalServiceChecklists}</strong> total records, 
                  and <strong>{stats.thisMonthRecords}</strong> records created this month.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Alerts and Notifications */}
        {(stats.overdueCount > 0 || stats.upcomingInspections > 0) && (
          <div className="space-y-3">
            {stats.overdueCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-xl">⚠️</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-red-700">
                      You have <strong>{stats.overdueCount}</strong> overdue invoice{stats.overdueCount > 1 ? 's' : ''} that need attention.
                    </p>
                    <div className="mt-2">
                      <Link href="/invoices">
                        <Button size="sm" variant="outline" className="text-red-700 border-red-300 hover:bg-red-100">
                          View Overdue Invoices
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {stats.upcomingInspections > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className="text-xl">📅</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-yellow-700">
                      You have <strong>{stats.upcomingInspections}</strong> gas safety inspection{stats.upcomingInspections > 1 ? 's' : ''} due in the next 30 days.
                    </p>
                    <div className="mt-2">
                      <Link href="/gas-safety">
                        <Button size="sm" variant="outline" className="text-yellow-700 border-yellow-300 hover:bg-yellow-100">
                          View Gas Safety Records
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatsCard
            title="Clients"
            value={stats.totalClients}
            icon="👥"
            href="/clients"
            color="blue"
          />
          <StatsCard
            title="Gas Safety Records"
            value={stats.totalGasSafety}
            icon="🔥"
            href="/gas-safety"
            color="red"
          />
          <StatsCard
            title="Invoices"
            value={stats.totalInvoices}
            icon="💰"
            href="/invoices"
            color="green"
          />
          <StatsCard
            title="Service Checklists"
            value={stats.totalServiceChecklists}
            icon="✅"
            href="/service-checklist"
            color="yellow"
          />
        </div>

        {/* Financial Overview */}
        {stats.totalInvoices > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              icon="💷"
              color="green"
            />
            <StatsCard
              title="Outstanding"
              value={formatCurrency(stats.outstandingAmount)}
              icon="⏳"
              color="yellow"
            />
            <StatsCard
              title="Overdue Invoices"
              value={stats.overdueCount}
              icon="⚠️"
              color="red"
            />
            <StatsCard
              title="This Month"
              value={stats.thisMonthRecords}
              icon="📅"
              color="blue"
            />
          </div>
        )}

        {/* Activity Overview */}
        {(stats.totalGasSafety > 0 || stats.totalInvoices > 0 || stats.totalServiceChecklists > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Total Records
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔥</span>
                      <span className="text-sm font-medium text-red-700">Gas Safety Records</span>
                    </div>
                    <div className="text-xl font-bold text-red-600">{stats.totalGasSafety}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">💰</span>
                      <span className="text-sm font-medium text-green-700">Invoices</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{stats.totalInvoices}</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">✅</span>
                      <span className="text-sm font-medium text-yellow-700">Service Checklists</span>
                    </div>
                    <div className="text-xl font-bold text-yellow-600">{stats.totalServiceChecklists}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="text-lg font-semibold text-orient-blue">{stats.thisMonthRecords}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last 7 Days</span>
                    <span className="text-lg font-semibold text-green-600">{stats.recentRecords}</span>
                  </div>
                  {stats.upcomingInspections > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Upcoming Inspections</span>
                      <span className="text-lg font-semibold text-yellow-600">{stats.upcomingInspections}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                      Keep up the great work! 🎉
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Link href="/clients" className="block">
                <Button className="w-full justify-center h-12 sm:h-auto" variant="outline">
                  <span className="mr-1 sm:mr-2">👥</span>
                  <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">Manage </span>Clients
                  </span>
                </Button>
              </Link>
              <Link href="/gas-safety/new" className="block">
                <Button className="w-full justify-center h-12 sm:h-auto">
                  <span className="mr-1 sm:mr-2">🔥</span>
                  <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">New </span>Gas Safety
                  </span>
                </Button>
              </Link>
              <Link href="/invoices/new" className="block">
                <Button className="w-full justify-center h-12 sm:h-auto" variant="secondary">
                  <span className="mr-1 sm:mr-2">💰</span>
                  <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">New </span>Invoice
                  </span>
                </Button>
              </Link>
              <Link href="/service-checklist/new" className="block">
                <Button className="w-full justify-center h-12 sm:h-auto" variant="outline">
                  <span className="mr-1 sm:mr-2">✅</span>
                  <span className="text-xs sm:text-sm">
                    <span className="hidden sm:inline">New </span>Service
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </DashboardLayout>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}