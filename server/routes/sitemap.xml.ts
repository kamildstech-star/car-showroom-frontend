import { fetchAndStreamSitemap } from '../utils/sitemap'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string) || 'http://localhost:8000'
  const prefix = (config.public.apiPrefix as string) || '/api/v1'
  const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

  await fetchAndStreamSitemap({
    apiBase,
    prefix,
    siteUrl,
    timeoutMs: 10000,
    res: event.node.res,
  })
})
