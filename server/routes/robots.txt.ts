export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

  const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/*
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`

  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  return robots
})
