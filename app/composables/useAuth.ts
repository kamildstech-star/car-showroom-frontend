import type { AdminUser, AuthResponse } from '~/types/auth'

export const useAuth = () => {
  const { apiFetch, rawBackendUrl } = useApi()

  // Nuxt state survives client transitions; no token in localStorage
  const user = useState<AdminUser | null>('auth-user', () => null)
  const isInitialized = useState<boolean>('auth-initialized', () => false)
  const loading = ref<boolean>(false)

  const isAuthenticated = computed(() => !!user.value)

  /**
   * Request Sanctum CSRF cookie
   */
  const csrf = async (): Promise<void> => {
    if (import.meta.server) return
    await $fetch(`${rawBackendUrl}/sanctum/csrf-cookie`, {
      credentials: 'include',
    })
  }

  /**
   * Fetch current authenticated admin (/api/v1/admin/me)
   */
  const fetchUser = async (): Promise<AdminUser | null> => {
    try {
      const res = await apiFetch<AuthResponse>('/admin/me')
      if (res && res.data) {
        user.value = res.data
        return res.data
      }
      user.value = null
      return null
    } catch {
      user.value = null
      return null
    } finally {
      isInitialized.value = true
    }
  }

  /**
   * Authenticate admin
   */
  const login = async (credentials: { email: string; password: string; remember?: boolean }): Promise<AuthResponse> => {
    loading.value = true
    try {
      // 1. Fetch fresh CSRF cookie from Laravel Sanctum
      await csrf()

      // 2. Submit login request with credentials and XSRF token
      const res = await apiFetch<AuthResponse>('/admin/login', {
        method: 'POST',
        body: credentials,
      })

      if (res.data) {
        user.value = res.data
      }

      return res
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout admin and invalidate session
   */
  const logout = async (): Promise<void> => {
    loading.value = true
    try {
      await apiFetch<AuthResponse>('/admin/logout', {
        method: 'POST',
      })
    } catch (err) {
      console.warn('Logout request completed with warning:', err)
    } finally {
      user.value = null
      loading.value = false
      await navigateTo('/admin/login')
    }
  }

  /**
   * Change password for current admin
   */
  const changePassword = async (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<AuthResponse> => {
    loading.value = true
    try {
      return await apiFetch<AuthResponse>('/admin/change-password', {
        method: 'POST',
        body: payload,
      })
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    isInitialized,
    loading,
    csrf,
    fetchUser,
    login,
    logout,
    changePassword,
  }
}
