import { isUserAdmin } from '@/lib/admin-utils'
import { redirect } from 'next/navigation'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await isUserAdmin()

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return <>{children}</>
}
