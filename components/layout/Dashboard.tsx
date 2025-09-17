'use client'

import { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { cn } from '@/utils/cn'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export function DashboardLayout({ children, title, actions }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content */}
        <div className="flex-1 lg:ml-0">
          {/* Page header */}
          {(title || actions) && (
            <div className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    {/* Mobile menu button */}
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-3"
                    >
                      <span className="sr-only">Open sidebar</span>
                      ☰
                    </button>
                    {title && (
                      <h1 className="text-2xl font-semibold text-gray-900">
                        {title}
                      </h1>
                    )}
                  </div>
                  {actions && (
                    <div className="flex items-center space-x-3">
                      {actions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Page content */}
          <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

// Quick stats card component
interface StatsCardProps {
  title: string
  value: string | number
  icon: string
  href?: string
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  href, 
  color = 'blue' 
}: StatsCardProps) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  const Card = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      {children}
    </div>
  )

  const content = (
    <>
      <div className="p-4 sm:p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-white",
              colors[color]
            )}>
              <span className="text-lg sm:text-xl">{icon}</span>
            </div>
          </div>
          <div className="ml-3 sm:ml-5 w-0 flex-1">
            <dl>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg sm:text-xl font-medium text-gray-900">
                {value}
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {href && (
        <div className="bg-gray-50 px-4 sm:px-5 py-2 sm:py-3">
          <div className="text-xs sm:text-sm">
            <span className="font-medium text-orient-blue hover:text-blue-700">
              View all →
            </span>
          </div>
        </div>
      )}
    </>
  )

  if (href) {
    return (
      <a href={href}>
        <Card>{content}</Card>
      </a>
    )
  }

  return <Card>{content}</Card>
}

// Recent activity component
interface RecentActivityProps {
  activities: {
    id: string
    type: 'gas_safety' | 'invoice' | 'service_checklist'
    title: string
    date: string
    status?: string
    client_name?: string
  }[]
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gas_safety': return '🔥'
      case 'invoice': return '💰'
      case 'service_checklist': return '✅'
      default: return '📄'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gas_safety': return 'Gas Safety Record'
      case 'invoice': return 'Invoice'
      case 'service_checklist': return 'Service Checklist'
      default: return 'Document'
    }
  }

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'sent':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <p className="text-gray-500 text-center py-8">
            No recent activity. Create your first record to get started!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index !== activities.length - 1 && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                        {getTypeIcon(activity.type)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:space-x-4">
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          <span className="sm:hidden">{getTypeIcon(activity.type)} </span>
                          <span className="hidden sm:inline">{getTypeLabel(activity.type)}: </span>
                          <span className="font-medium text-gray-900">
                            {activity.title}
                          </span>
                        </p>
                        {activity.client_name && (
                          <p className="text-xs text-gray-400 mt-1">
                            Client: {activity.client_name}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          {activity.status && (
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                              getStatusColor(activity.status)
                            )}>
                              {activity.status}
                            </span>
                          )}
                          <div className="text-xs sm:text-sm text-gray-500 sm:hidden">
                            {formatRelativeDate(activity.date)}
                          </div>
                        </div>
                      </div>
                      <div className="hidden sm:block text-right text-sm whitespace-nowrap text-gray-500">
                        {formatRelativeDate(activity.date)}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}