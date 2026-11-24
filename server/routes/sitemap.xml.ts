export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || 'http://localhost:8000'
  const prefix = config.public.apiPrefix || '/api/v1'
  const siteUrl = (config.public.siteUrl as string) || 'https://hassanmotors.pk'

  // Fetch published cars from Laravel API
  let cars: { slug: string; published_at?: string; created_at?: string }[] = []
  try {
    const res = await $fetch<{ data: { slug: string; published_at?: string; created_at?: string }[] }>(
      `${apiBase}${prefix}/cars?per_page=100`
    )
    cars = res.data || []
  } catch (err) {
    console.error('[Sitemap] Failed to fetch cars from API:', err)
  }

  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/cars', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  ]

  const urls = [
    ...staticRoutes.map(r => `  <url>
    <loc>${siteUrl}${r.loc}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`),
    ...cars.map(c => {
      const rawDate = c.published_at || c.created_at || new Date().toISOString()
      const dateOnly = rawDate.split('T')[0]
      return `  <url>
    <loc>${siteUrl}/cars/${c.slug}</loc>
    <lastmod>${dateOnly}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
    }),
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')

  return sitemapXml
})
