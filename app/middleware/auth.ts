export default defineNuxtRouteMiddleware(async (to) => {
  const { user, isInitialized, fetchUser } = useAuth()

  // On first access, check session with backend if not yet checked
  if (!isInitialized.value) {
    await fetchUser()
  }

  // If not authenticated, redirect to admin login
  if (!user.value) {
    return navigateTo({
      path: '/admin/login',
      query: to.path !== '/admin' ? { redirect: to.fullPath } : undefined,
    })
  }
})
