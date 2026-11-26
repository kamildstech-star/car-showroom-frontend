import test from 'node:test'
import assert from 'node:assert/strict'
import {
  escapeXml,
  fetchAndStreamSitemap,
  formatUrlNode,
  streamCarsIntoResponse,
} from '../server/utils/sitemap.ts'

function createMockRes() {
  const headers: Record<string, string> = {}
  const chunks: string[] = []
  let ended = false
  let destroyedWith: Error | undefined
  return {
    res: {
      statusCode: 0,
      setHeader(name: string, value: string) {
        headers[name.toLowerCase()] = value
      },
      write(chunk: string) {
        chunks.push(chunk)
      },
      end(chunk?: string) {
        if (chunk) chunks.push(chunk)
        ended = true
      },
      destroy(error?: Error) {
        destroyedWith = error ?? new Error('Destroyed')
      },
    },
    headers,
    getBody: () => chunks.join(''),
    isEnded: () => ended,
    getDestroyedError: () => destroyedWith,
  }
}

function makeStream(lines: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      for (const line of lines) {
        controller.enqueue(encoder.encode(line))
      }
      controller.close()
    },
  })
}

test('formatUrlNode omits lastmod when absent and escapes XML characters', () => {
  const withoutLastmod = formatUrlNode('https://hassanmotors.pk/cars/honda-civic', 'weekly', '0.8')
  assert.equal(withoutLastmod.includes('<lastmod>'), false)
  assert.equal(withoutLastmod.includes('<priority>0.8</priority>'), true)

  const escaped = escapeXml('a&b<c>"d\'e')
  assert.equal(escaped, 'a&amp;b&lt;c&gt;&quot;d&apos;e')
})

test('streamCarsIntoResponse handles >100 cars, sold priority, and missing lastmod', async () => {
  const lines = ['[\n']
  for (let i = 1; i <= 125; i++) {
    const isSold = i === 125
    const entry = isSold
      ? { slug: `car-${i}`, status: 'sold' }
      : { slug: `car-${i}`, status: 'available', lastmod: '2026-11-25' }
    lines.push(`${JSON.stringify(entry)}${i < 125 ? ',' : ''}\n`)
  }
  lines.push(']')

  const chunks: string[] = []
  const count = await streamCarsIntoResponse(makeStream(lines), 'https://hassanmotors.pk', (c) =>
    chunks.push(c)
  )
  const xml = chunks.join('')

  assert.equal(count, 125)
  assert.equal(xml.includes('https://hassanmotors.pk/cars/car-124</loc>\n    <lastmod>2026-11-25</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>'), true)
  assert.equal(xml.includes('https://hassanmotors.pk/cars/car-125</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>'), true)
})

test('fetchAndStreamSitemap returns 502 with no-store on non-2xx API response', async () => {
  const mock = createMockRes()
  const logged: string[] = []

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    res: mock.res,
    fetchImpl: async () => new Response('Server Error', { status: 500 }),
    logger: { error: (msg: unknown) => logged.push(String(msg)) },
  })

  assert.equal(mock.res.statusCode, 502)
  assert.equal(mock.headers['cache-control'], 'no-store, no-cache, must-revalidate')
  assert.equal(mock.isEnded(), true)
  assert.equal(logged.some((m) => m.includes('HTTP 500')), true)
})

test('fetchAndStreamSitemap returns 502 with no-store on empty body', async () => {
  const mock = createMockRes()
  const logged: string[] = []

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    res: mock.res,
    fetchImpl: async () => new Response(null, { status: 200 }),
    logger: { error: (msg: unknown) => logged.push(String(msg)) },
  })

  assert.equal(mock.res.statusCode, 502)
  assert.equal(mock.headers['cache-control'], 'no-store, no-cache, must-revalidate')
  assert.equal(logged.some((m) => m.includes('empty response body')), true)
})

test('fetchAndStreamSitemap returns 504 with no-store on timeout', async () => {
  const mock = createMockRes()
  const logged: string[] = []

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    timeoutMs: 25,
    res: mock.res,
    fetchImpl: (_input, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          const err = new Error('Aborted')
          err.name = 'AbortError'
          reject(err)
        })
      }),
    logger: { error: (msg: unknown) => logged.push(String(msg)) },
  })

  assert.equal(mock.res.statusCode, 504)
  assert.equal(mock.headers['cache-control'], 'no-store, no-cache, must-revalidate')
  assert.equal(logged.some((m) => m.includes('timed out')), true)
})

test('fetchAndStreamSitemap destroys response on mid-stream error after partial car output', async () => {
  const mock = createMockRes()
  const logged: string[] = []
  const encoder = new TextEncoder()

  const failingStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('[\n'))
      controller.enqueue(encoder.encode('{"slug":"car-1","status":"available"},\n'))
    },
    pull(controller) {
      controller.error(new Error('Upstream connection reset mid-stream'))
    },
  })

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    res: mock.res,
    fetchImpl: async () => new Response(failingStream, { status: 200 }),
    logger: { error: (msg: unknown) => logged.push(String(msg)) },
  })

  assert.equal(mock.getBody().includes('https://hassanmotors.pk/cars/car-1'), true)
  assert.equal(mock.getBody().includes('</urlset>'), false)
  assert.equal(mock.isEnded(), false)
  assert.equal(mock.getDestroyedError()?.message, 'Upstream connection reset mid-stream')
  assert.equal(logged.some((m) => m.includes('Failed to stream cars')), true)
})

test('fetchAndStreamSitemap destroys response on timeout during body streaming', async () => {
  const mock = createMockRes()
  const logged: string[] = []
  const encoder = new TextEncoder()

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    timeoutMs: 30,
    res: mock.res,
    fetchImpl: async (_input, init) => {
      let sentFirstChunk = false
      const hangingStream = new ReadableStream<Uint8Array>({
        pull(controller) {
          if (!sentFirstChunk) {
            sentFirstChunk = true
            controller.enqueue(
              encoder.encode('[\n{"slug":"car-first","status":"available"},\n')
            )
            return
          }
          return new Promise<void>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () => {
              const err = new Error('Aborted mid-stream')
              err.name = 'AbortError'
              controller.error(err)
              reject(err)
            })
          })
        },
      })
      return new Response(hangingStream, { status: 200 })
    },
    logger: { error: (msg: unknown) => logged.push(String(msg)) },
  })

  assert.equal(mock.getBody().includes('https://hassanmotors.pk/cars/car-first'), true)
  assert.equal(mock.getBody().includes('</urlset>'), false)
  assert.equal(mock.isEnded(), false)
  assert.equal(mock.getDestroyedError()?.name, 'AbortError')
  assert.equal(logged.some((m) => m.includes('timed out')), true)
})

test('fetchAndStreamSitemap produces complete valid XML on success', async () => {
  const mock = createMockRes()

  await fetchAndStreamSitemap({
    apiBase: 'http://127.0.0.1:8000',
    prefix: '/api/v1',
    siteUrl: 'https://hassanmotors.pk',
    res: mock.res,
    fetchImpl: async () =>
      new Response(
        makeStream(['[\n{"slug":"toyota-corolla-2023","status":"available","lastmod":"2026-11-25"}\n]']),
        { status: 200 }
      ),
  })

  const body = mock.getBody()
  assert.equal(mock.res.statusCode, 200)
  assert.equal(mock.headers['content-type'], 'application/xml; charset=utf-8')
  assert.equal(mock.isEnded(), true)
  assert.equal(mock.getDestroyedError(), undefined)
  assert.equal(body.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), true)
  assert.equal(body.includes('</urlset>'), true)
  assert.equal(body.includes('https://hassanmotors.pk/cars/toyota-corolla-2023'), true)
})

test('fetchAndStreamSitemap rethrows instead of calling res.end() when destroy is unavailable', async () => {
  const chunks: string[] = []
  let ended = false
  const logged: string[] = []
  const encoder = new TextEncoder()

  const resWithoutDestroy = {
    statusCode: 0,
    setHeader() {},
    write(chunk: string) {
      chunks.push(chunk)
    },
    end() {
      ended = true
    },
  }

  const failingStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode('[\n{"slug":"car-1","status":"available"},\n'))
    },
    pull(controller) {
      controller.error(new Error('Stream dropped'))
    },
  })

  await assert.rejects(
    () =>
      fetchAndStreamSitemap({
        apiBase: 'http://127.0.0.1:8000',
        prefix: '/api/v1',
        siteUrl: 'https://hassanmotors.pk',
        res: resWithoutDestroy,
        fetchImpl: async () => new Response(failingStream, { status: 200 }),
        logger: { error: (msg: unknown) => logged.push(String(msg)) },
      }),
    /Stream dropped/
  )

  assert.equal(ended, false)
  assert.equal(chunks.join('').includes('</urlset>'), false)
  assert.equal(logged.some((m) => m.includes('destroy unavailable')), true)
})
