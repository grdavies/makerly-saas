export default defineNuxtRouteMiddleware((to) => {
  const { isSuperAdmin, isTeamAdmin, currentRole } = useAuth()
  const { can } = useRBAC()

  // Define admin-only routes
  const adminRoutes = [
    '/admin',
    '/settings/team',
    '/settings/users',
    '/settings/roles'
  ]

  // Define super-admin-only routes
  const superAdminRoutes = [
    '/admin/system',
    '/admin/teams',
    '/admin/users',
    '/admin/permissions'
  ]

  // Check if current route requires admin access
  const requiresAdmin = adminRoutes.some(route => 
    to.path.startsWith(route)
  )

  // Check if current route requires super admin access
  const requiresSuperAdmin = superAdminRoutes.some(route => 
    to.path.startsWith(route)
  )

  // Redirect if user doesn't have required permissions
  if (requiresSuperAdmin && !isSuperAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Super admin privileges required.'
    })
  }

  if (requiresAdmin && !isTeamAdmin.value && !isSuperAdmin.value) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.'
    })
  }

  // Check specific permissions for certain routes
  if (to.path.startsWith('/settings/users') && !can('read', 'user', 'team')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You do not have permission to view users.'
    })
  }

  if (to.path.startsWith('/settings/roles') && !can('read', 'role', 'team')) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. You do not have permission to view roles.'
    })
  }
})
