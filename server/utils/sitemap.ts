export interface SitemapCarItem {
  slug: string
  status: 'available' | 'sold' | string
  lastmod?: string | null
}

export const STATIC_SITEMAP_ROUTES = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/cars', changefreq: 'daily', priority: '0.9' },
  { loc: '/about', changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact', changefreq: 'monthly', priority: '0.8' },
] as const

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function formatUrlNode(
  loc: string,
  changefreq: string,
  priority: string,
  lastmod?: string | null
): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`
}

export async function streamCarsIntoResponse(
  body: ReadableStream<Uint8Array>,
  siteUrl: string,
  write: (chunk: string) => void
): Promise<number> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let count = 0

  const processLine = (rawLine: string) => {
    const trimmed = rawLine.trim().replace(/,$/, '')
    if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) return
    try {
      const item = JSON.parse(trimmed) as SitemapCarItem
      if (!item.slug) return
      const isSold = item.status === 'sold'
      const priority = isSold ? '0.5' : '0.8'
      const changefreq = isSold ? 'monthly' : 'weekly'
      write(
        formatUrlNode(
          `${siteUrl}/cars/${item.slug}`,
          changefreq,
          priority,
          item.lastmod || undefined
        )
      )
      count++
    } catch {
      // Ignore malformed JSON line
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

  return count
}

export interface SitemapResponseWriter {
  statusCode: number
  setHeader: (name: string, value: string) => void
  write: (chunk: string) => void
  end: (chunk?: string) => void
  destroy?: (error?: Error) => void
}

export interface FetchAndStreamSitemapOptions {
  apiBase: string
  prefix: string
  siteUrl: string
  timeoutMs?: number
  fetchImpl?: typeof fetch
  res: SitemapResponseWriter
  logger?: Pick<Console, 'error'>
}

export async function fetchAndStreamSitemap({
  apiBase,
  prefix,
  siteUrl,
  timeoutMs = 10000,
  fetchImpl = fetch,
  res,
  logger = console,
}: FetchAndStreamSitemapOptions): Promise<void> {
  const cleanApiBase = apiBase.replace(/\/$/, '')
  const cleanSiteUrl = siteUrl.replace(/\/$/, '')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let streamingStarted = false

  try {
    const apiResponse = await fetchImpl(`${cleanApiBase}${prefix}/sitemap/cars`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!apiResponse.ok) {
      logger.error(`[Sitemap] Upstream API returned HTTP ${apiResponse.status}`)
      res.statusCode = 502
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.end('Sitemap temporarily unavailable.')
      return
    }

    if (!apiResponse.body) {
      logger.error('[Sitemap] Upstream API returned an empty response body')
      res.statusCode = 502
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.end('Sitemap temporarily unavailable.')
      return
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    res.setHeader('X-Accel-Buffering', 'no')
    streamingStarted = true

    res.write('<?xml version="1.0" encoding="UTF-8"?>\n')
    res.write('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n')

    for (const route of STATIC_SITEMAP_ROUTES) {
      res.write(formatUrlNode(`${cleanSiteUrl}${route.loc}`, route.changefreq, route.priority))
    }

    await streamCarsIntoResponse(apiResponse.body, cleanSiteUrl, (chunk) => res.write(chunk))

    res.write('</urlset>\n')
    res.end()
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError'
    logger.error(
      isAbort
        ? `[Sitemap] Upstream API request timed out after ${timeoutMs}ms`
        : '[Sitemap] Failed to stream cars from API:',
      isAbort ? undefined : err
    )

    if (!streamingStarted) {
      res.statusCode = isAbort ? 504 : 502
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.end('Sitemap temporarily unavailable.')
    } else if (typeof res.destroy === 'function') {
      // Abort the chunked HTTP response without a terminating chunk or </urlset>
      // so proxies, CDNs, and crawlers never cache an incomplete sitemap as complete.
      res.destroy(err instanceof Error ? err : new Error(String(err)))
    } else {
      res.end()
    }
  } finally {
    clearTimeout(timer)
  }
}
