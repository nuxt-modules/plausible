import { fetch } from '@nuxt/test-utils/e2e'

export function postEvent(headers: Record<string, string> = {}, body?: string) {
  return fetch('/_plausible/api/event', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: body ?? JSON.stringify({ n: 'pageview', d: 'example.com', u: 'https://example.com/' }),
  })
}
