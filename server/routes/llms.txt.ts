import { buildLlmsTxt } from '../utils/llms'

interface PublicSettingsResponse {
  success?: boolean
  data?: Record<string, string | undefined>
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = ((config.public.apiBase as string) || 'http://localhost:8000').replace(/\/$/, '')
  const prefix = (config.public.apiPrefix as string) || '/api/v1'
  const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

  let apiData: Record<string, string | undefined> = {}
  try {
    const res = await $fetch<PublicSettingsResponse>(`${apiBase}${prefix}/settings`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    })
    apiData = res?.data || {}
  } catch (err) {
    console.error('[llms.txt] Failed to fetch public settings:', err)
  }

  const content = buildLlmsTxt(siteUrl, apiData)

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return content
})
