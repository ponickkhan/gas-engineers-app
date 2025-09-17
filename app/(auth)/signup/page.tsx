import { AuthGuard } from '@/components/auth/AuthGuard'
import { SignupForm } from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <AuthGuard requireAuth={false}>
      <SignupForm />
    </AuthGuard>
  )
}