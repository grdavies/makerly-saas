export default defineNuxtRouteMiddleware(to => {
  const { isAuthenticated, loading } = useAuth();

  // Skip middleware if still loading
  if (loading.value) return;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated.value) {
    return navigateTo('/');
  }
});
