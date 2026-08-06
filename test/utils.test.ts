import type { PlausibleRequestPayload } from '@plausible-analytics/tracker'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildHostnameFilter } from '../src/runtime/utils'

const payload = { n: 'pageview' } as unknown as PlausibleRequestPayload

function stubHostname(hostname: string) {
  vi.stubGlobal('window', { location: { hostname } })
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('buildHostnameFilter', () => {
  it('returns no filter when only localhost is ignored', () => {
    expect(buildHostnameFilter(['localhost'], false)).toBeUndefined()
  })

  it('drops an event sent from an ignored hostname', () => {
    stubHostname('staging.example.com')
    const filter = buildHostnameFilter(['staging.example.com'], false)

    expect(filter!(payload)).toBeNull()
  })

  it('passes an event through from a hostname that is not ignored', () => {
    stubHostname('example.com')
    const filter = buildHostnameFilter(['staging.example.com'], false)

    expect(filter!(payload)).toBe(payload)
  })

  it('passes a subdomain through when ignoreSubDomains is false', () => {
    stubHostname('preview.staging.example.com')
    const filter = buildHostnameFilter(['staging.example.com'], false)

    expect(filter!(payload)).toBe(payload)
  })

  it('drops a subdomain of an ignored hostname when subdomains are ignored', () => {
    stubHostname('preview.staging.example.com')
    const filter = buildHostnameFilter(['staging.example.com'], true)

    expect(filter!(payload)).toBeNull()
  })

  it('passes notstaging.example.com through when staging.example.com is ignored', () => {
    stubHostname('notstaging.example.com')
    const filter = buildHostnameFilter(['staging.example.com'], true)

    expect(filter!(payload)).toBe(payload)
  })
})
