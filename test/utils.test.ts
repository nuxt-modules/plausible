import { describe, expect, it } from 'vitest'
import { isRouteWithin } from '../src/utils'

describe('isRouteWithin', () => {
  it.each([
    ['/_plausible/x', '/_plausible'],
    ['/_plausible', '/_plausible'],
    ['/api/event', '/'],
    ['/_plausible/x', '/_plausible//'],
  ])('matches %s against %s', (route, base) => {
    expect(isRouteWithin(route, base)).toBe(true)
  })

  it('never matches /_plausible-other/x (which only shares the prefix) against /_plausible', () => {
    expect(isRouteWithin('/_plausible-other/x', '/_plausible')).toBe(false)
  })
})
