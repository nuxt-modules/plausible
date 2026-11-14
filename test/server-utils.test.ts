import { describe, expect, it } from 'vitest'
import { readBodyStream } from '../src/runtime/server/utils'

const encoder = new TextEncoder()

describe('readBodyStream', () => {
  it('rejects with 400 for a stream that errors mid-body', async () => {
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(encoder.encode('{"n":"pagev'))
        controller.error(new Error('aborted'))
      },
    })

    await expect(readBodyStream(stream, 16)).rejects.toMatchObject({ status: 400 })
  })

  it('rejects with 413 once the stream passes the limit, before it ends', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('x'.repeat(17)))
      },
    })

    await expect(readBodyStream(stream, 16)).rejects.toMatchObject({ status: 413 })
  })

  it('resolves with a body exactly at the limit', async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode('{"n":"page'))
        controller.enqueue(encoder.encode('view"}'))
        controller.close()
      },
    })

    await expect(readBodyStream(stream, 16)).resolves.toEqual(encoder.encode('{"n":"pageview"}'))
  })
})
