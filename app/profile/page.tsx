import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserProfile } from '@/components/auth/UserProfile'
import { DashboardLayout } from '@/components/layout/Dashboard'

export default function ProfilePage() {
  return (
    <AuthGuard>
      <DashboardLayout title="Profile Settings">
        <UserProfile />
      </DashboardLayout>
    </AuthGuard>
  )
}