export default defineNuxtRouteMiddleware(to => {
  const { isAuthenticated, loading } = useAuth();

  // Skip middleware if still loading
  if (loading.value) return;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/signup',
    '/auth/reset-password',
    '/auth/callback',
    '/auth/confirm',
    '/pricing',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ];

  // Check if current route is public
  const isPublicRoute = publicRoutes.some(
    route => to.path === route || to.path.startsWith(route + '/')
  );

  // Redirect to login if not authenticated and not on public route
  if (!isAuthenticated.value && !isPublicRoute) {
    return navigateTo('/auth/login');
  }

  // Redirect to dashboard if authenticated and on login/signup pages
  if (
    isAuthenticated.value &&
    (to.path === '/auth/login' || to.path === '/auth/signup')
  ) {
    return navigateTo('/');
  }
});
