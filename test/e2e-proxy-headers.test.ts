import type { IncomingHttpHeaders } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Buffer } from 'node:buffer'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { fetch, setup } from '@nuxt/test-utils/e2e'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

const upstreamHeaders: IncomingHttpHeaders[] = []
const upstreamBodies: string[] = []

const upstream = createServer((request, response) => {
  upstreamHeaders.push(request.headers)

  const chunks: Buffer[] = []
  request.on('data', chunk => chunks.push(chunk))
  request.on('end', () => {
    upstreamBodies.push(Buffer.concat(chunks).toString())
    response.writeHead(202).end('ok')
  })
})

await new Promise<void>(resolve => upstream.listen(0, '127.0.0.1', resolve))
const { port } = upstream.address() as AddressInfo

function postEvent(headers: Record<string, string>) {
  return fetch('/_plausible/api/event', {
    method: 'POST',
    headers: {
      'content-type': 'text/plain',
      'user-agent': 'Mozilla/5.0 (Macintosh)',
      ...headers,
    },
    body: JSON.stringify({ n: 'pageview', d: 'example.com', u: 'https://example.com/' }),
  })
}

describe('event proxy', async () => {
  await setup({
    server: true,
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
    nuxtConfig: {
      plausible: {
        proxy: true,
        apiHost: `http://127.0.0.1:${port}`,
      },
    },
  })

  beforeEach(() => {
    upstreamHeaders.length = 0
    upstreamBodies.length = 0
  })

  afterAll(() => {
    upstream.close()
  })

  it('withholds cookie', async () => {
    await postEvent({ cookie: 'session=secret' })

    expect(upstreamHeaders).toHaveLength(1)
    expect(upstreamHeaders[0]!.cookie).toBeUndefined()
  })

  it('withholds authorization', async () => {
    await postEvent({ authorization: 'Bearer secret' })

    expect(upstreamHeaders[0]!.authorization).toBeUndefined()
  })

  it('forwards user-agent', async () => {
    await postEvent({})

    expect(upstreamHeaders[0]!['user-agent']).toBe('Mozilla/5.0 (Macintosh)')
  })

  it('adds x-forwarded-for from the connection when the request carries none', async () => {
    await postEvent({})

    expect(upstreamHeaders[0]!['x-forwarded-for']).toMatch(/(?:^|:)(?:127\.0\.0\.1|1)$/)
  })

  it('takes the first entry of an inbound x-forwarded-for', async () => {
    await postEvent({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })

    expect(upstreamHeaders[0]!['x-forwarded-for']).toBe('203.0.113.7')
  })

  it('forwards content-type', async () => {
    await postEvent({})

    expect(upstreamHeaders[0]!['content-type']).toBe('text/plain')
  })

  it('forwards the event body', async () => {
    const response = await postEvent({})

    expect(response.status).toBe(202)
    expect(JSON.parse(upstreamBodies[0]!)).toMatchObject({ n: 'pageview', d: 'example.com' })
  })
})
