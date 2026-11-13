import type { Readable } from 'node:stream'
import { Buffer } from 'node:buffer'
import { createError } from 'h3'

/**
 * Reads a body stream and stops at `limit`, because a chunked request declares no
 * length to turn it away by.
 */
export function readBodyStream(stream: Readable, limit: number): Promise<Buffer | undefined> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0

    stream.on('data', onData).on('end', onEnd).on('error', onError)

    function onData(chunk: Buffer) {
      size += chunk.length
      if (size > limit) {
        // The rest of the body flows on with no listener, so Node discards it.
        removeListeners()
        reject(payloadTooLargeError())
        return
      }
      chunks.push(chunk)
    }

    function onEnd() {
      removeListeners()
      resolve(chunks.length > 0
        ? Buffer.concat(chunks)
        : undefined)
    }

    function onError() {
      removeListeners()
      reject(unreadablePayloadError())
    }

    function removeListeners() {
      stream.off('data', onData).off('end', onEnd).off('error', onError)
    }
  })
}

export function payloadTooLargeError() {
  return createError({
    statusCode: 413,
    message: 'Event payload too large',
  })
}

export function unreadablePayloadError() {
  return createError({
    statusCode: 400,
    message: 'Event payload could not be read',
  })
}
