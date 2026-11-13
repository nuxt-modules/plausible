import { Buffer } from 'node:buffer'
import { PassThrough } from 'node:stream'
import { describe, expect, it } from 'vitest'
import { readBodyStream } from '../src/runtime/server/utils'

describe('readBodyStream', () => {
  it('rejects with 400 for a stream that errors mid-body', async () => {
    const stream = new PassThrough()
    const body = readBodyStream(stream, 16)
    stream.write('{"n":"pagev')
    stream.destroy(new Error('aborted'))

    await expect(body).rejects.toMatchObject({ statusCode: 400 })
  })

  it('rejects with 413 once the stream passes the limit, before it ends', async () => {
    const stream = new PassThrough()
    const body = readBodyStream(stream, 16)
    stream.write('x'.repeat(17))

    await expect(body).rejects.toMatchObject({ statusCode: 413 })
  })

  it('resolves with a body exactly at the limit', async () => {
    const stream = new PassThrough()
    const body = readBodyStream(stream, 16)
    stream.end('{"n":"pageview"}')

    await expect(body).resolves.toEqual(Buffer.from('{"n":"pageview"}'))
  })
})
