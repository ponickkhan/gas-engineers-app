import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard - this will be handled by auth middleware later
  redirect('/dashboard')
}