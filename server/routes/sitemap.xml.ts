interface SitemapCarItem {
  slug: string
  status: 'available' | 'sold' | string
  lastmod?: string | null
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatUrlNode(
  loc: string,
  changefreq: string,
  priority: string,
  lastmod?: string | null
): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = ((config.public.apiBase as string) || 'http://localhost:8000').replace(/\/$/, '')
  const prefix = (config.public.apiPrefix as string) || '/api/v1'
  const siteUrl = ((config.public.siteUrl as string) || 'https://hassanmotors.pk').replace(/\/$/, '')

  const res = event.node.res
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.setHeader('X-Accel-Buffering', 'no')

  res.write('<?xml version="1.0" encoding="UTF-8"?>\n')
  res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

  const staticRoutes = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/cars', changefreq: 'daily', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
  ]

  for (const route of staticRoutes) {
    res.write(formatUrlNode(`${siteUrl}${route.loc}`, route.changefreq, route.priority))
  }

  try {
    const apiResponse = await fetch(`${apiBase}${prefix}/sitemap/cars`, {
      headers: { Accept: 'application/json' },
    })

    if (apiResponse.ok && apiResponse.body) {
      const reader = apiResponse.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const processLine = (rawLine: string) => {
        const trimmed = rawLine.trim().replace(/,$/, '')
        if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return
        try {
          const item = JSON.parse(trimmed) as SitemapCarItem
          if (!item.slug) return
          const isSold = item.status === 'sold'
          const priority = isSold ? '0.5' : '0.8'
          const changefreq = isSold ? 'monthly' : 'weekly'
          res.write(
            formatUrlNode(
              `${siteUrl}/cars/${item.slug}`,
              changefreq,
              priority,
              item.lastmod || undefined
            )
          )
        } catch {
          // Ignore malformed chunk line
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          processLine(line)
        }
      }

      buffer += decoder.decode()
      if (buffer.trim()) {
        for (const line of buffer.split('\n')) {
          processLine(line)
        }
      }
    }
  } catch (err) {
    console.error('[Sitemap] Failed to stream cars from API:', err)
  }

  res.write('</urlset>\n')
  res.end()
})
