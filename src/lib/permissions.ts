import { redirect } from 'next/navigation'
import { getCurrentUser, type CurrentUser } from '@/lib/auth'
import { isStaff, isSuperAdmin } from '@/lib/roles'

/** For pages: redirects unless the viewer is an Admin or Super Admin. */
export async function requireStaffPage(redirectTo = '/admin'): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!isStaff(user.role)) redirect(`/login?redirectTo=${redirectTo}`)
  return user
}

/**
 * For pages: guests go to the login page; signed-in users who are not a
 * Super Admin are sent to `fallback`.
 */
export async function requireSuperAdminPage(
  loginRedirect: string,
  fallback = '/'
): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (user.role === 'guest') redirect(`/login?redirectTo=${loginRedirect}`)
  if (!isSuperAdmin(user.role)) redirect(fallback)
  return user
}
