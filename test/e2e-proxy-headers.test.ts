import { join } from 'node:path'
import { setup } from '@nuxt/test-utils/e2e'
import { serve } from 'srvx'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { postEvent } from './post-event'

const upstreamHeaders: Headers[] = []
const upstreamBodies: string[] = []

// A stand-in for Plausible, so what the proxy passes on is observable.
const upstream = serve({
  hostname: '127.0.0.1',
  port: 0,
  silent: true,
  async fetch(request) {
    upstreamHeaders.push(request.headers)
    upstreamBodies.push(await request.text())
    return new Response('ok', { status: 202 })
  },
})

await upstream.ready()

describe('event proxy', async () => {
  await setup({
    server: true,
    rootDir: join(import.meta.dirname, 'fixture'),
    nuxtConfig: {
      plausible: {
        proxy: true,
        apiHost: upstream.url,
      },
    },
  })

  beforeEach(() => {
    upstreamHeaders.length = 0
    upstreamBodies.length = 0
  })

  afterAll(async () => {
    await upstream.close()
  })

  it('withholds cookie', async () => {
    await postEvent({ cookie: 'session=secret' })

    expect(upstreamHeaders).toHaveLength(1)
    expect(upstreamHeaders[0]!.get('cookie')).toBeNull()
  })

  it('withholds authorization', async () => {
    await postEvent({ authorization: 'Bearer secret' })

    expect(upstreamHeaders[0]!.get('authorization')).toBeNull()
  })

  it('forwards user-agent', async () => {
    await postEvent({ 'user-agent': 'Mozilla/5.0 (Macintosh)' })

    expect(upstreamHeaders[0]!.get('user-agent')).toBe('Mozilla/5.0 (Macintosh)')
  })

  it('forwards content-type', async () => {
    await postEvent({ 'content-type': 'text/plain' })

    expect(upstreamHeaders[0]!.get('content-type')).toBe('text/plain')
  })

  it('adds x-forwarded-for from the connection when the request carries none', async () => {
    await postEvent()

    expect(upstreamHeaders[0]!.get('x-forwarded-for')).toMatch(/(?:^|:)(?:127\.0\.0\.1|1)$/)
  })

  it('takes the first entry of an inbound x-forwarded-for', async () => {
    await postEvent({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })

    expect(upstreamHeaders[0]!.get('x-forwarded-for')).toBe('203.0.113.7')
  })

  it('forwards the event body', async () => {
    const response = await postEvent()

    expect(response.status).toBe(202)
    expect(JSON.parse(upstreamBodies[0]!)).toMatchObject({ n: 'pageview', d: 'example.com' })
  })
})
