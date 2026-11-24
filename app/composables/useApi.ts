import type { UseFetchOptions } from 'nuxt/app'
import type { HealthStatus } from '~/types/api'

/**
 * Extract XSRF-TOKEN cookie value on the client side.
 */
export function getXsrfToken(): string | null {
  if (import.meta.server) return null
  const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'))
  return match ? decodeURIComponent(match[2]) : null
}

/**
 * Custom API client composable for Hassan Motors.
 * Wraps Nuxt's $fetch with the configured base URL,
 * `/api/v1` prefix, default JSON headers, CSRF token, and cookie credentials.
 */
export const useApi = () => {
  const config = useRuntimeConfig()
  const rawBase = (config.public.apiBase as string) || 'http://localhost:8000'
  const prefix = (config.public.apiPrefix as string) || '/api/v1'
  const apiBaseUrl = `${rawBase}${prefix}`

  /**
   * Raw fetch wrapper with CSRF & cookie credentials
   */
  const apiFetch = $fetch.create({
    baseURL: apiBaseUrl,
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
    onRequest({ options }) {
      if (import.meta.client) {
        const xsrf = getXsrfToken()
        if (xsrf) {
          options.headers = {
            ...options.headers,
            'X-XSRF-TOKEN': xsrf,
          }
        }
      }
    },
    onResponseError({ response }) {
      if (response.status !== 401) {
        console.error(`[API Error] ${response.status}: ${response.statusText}`, response._data)
      }
    },
  })

  /**
   * SSR-friendly useFetch wrapper
   */
  const fetchWithState = <T>(endpoint: string, opts?: UseFetchOptions<T>) => {
    return useFetch<T>(endpoint, {
      baseURL: apiBaseUrl,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
      onRequest({ options }) {
        if (import.meta.client) {
          const xsrf = getXsrfToken()
          if (xsrf) {
            options.headers = {
              ...options.headers,
              'X-XSRF-TOKEN': xsrf,
            }
          }
        }
      },
      ...opts,
    })
  }

  /**
   * Health check convenience method
   */
  const getHealth = () => apiFetch<HealthStatus>('/health')

  return {
    apiFetch,
    fetchWithState,
    getHealth,
    apiBaseUrl,
    rawBackendUrl: rawBase,
  }
}
