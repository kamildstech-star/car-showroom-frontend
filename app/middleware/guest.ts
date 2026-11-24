export default defineNuxtRouteMiddleware(async () => {
  const { user, isInitialized, fetchUser } = useAuth()

  if (!isInitialized.value) {
    await fetchUser()
  }

  // If already authenticated, redirect from login to admin dashboard
  if (user.value) {
    return navigateTo('/admin')
  }
})
