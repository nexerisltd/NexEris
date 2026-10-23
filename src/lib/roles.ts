// Pure role helpers — safe to import from both server and client code.

export type UserRole = 'guest' | 'member' | 'admin' | 'super_admin'
export type ProfileRole = Exclude<UserRole, 'guest'>

export const ROLE_LABELS: Record<ProfileRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  member: 'Member',
}

/** Admin or Super Admin — can open /admin and add EXP / new members. */
export const isStaff = (role: UserRole) => role === 'admin' || role === 'super_admin'

/** Super Admin — can modify or access everything. */
export const isSuperAdmin = (role: UserRole) => role === 'super_admin'

/** Any signed-in team member (member, admin, super admin). */
export const isSignedInMember = (role: UserRole) => role !== 'guest'

// Top-level routes that must never be claimed as a profile username.
export const RESERVED_USERNAMES = [
  'about', 'products', 'team', 'admin', 'login', 'dashboard', 'auth', 'api', 'docs', 'edit', 'new',
]
