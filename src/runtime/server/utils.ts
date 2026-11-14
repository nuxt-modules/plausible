import { createError } from 'nuxt/server'

/**
 * Reads a body stream and stops at `limit`, because a chunked request declares no
 * length to turn it away by.
 */
export async function readBodyStream(stream: ReadableStream<Uint8Array> | null, limit: number): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (!stream)
    return

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0

  while (true) {
    const result = await reader.read().catch(() => {
      throw unreadablePayloadError()
    })
    if (result.done)
      break

    size += result.value.byteLength
    if (size > limit) {
      reader.cancel().catch(() => {})
      throw payloadTooLargeError()
    }
    chunks.push(result.value)
  }

  if (chunks.length === 0)
    return

  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

export function payloadTooLargeError() {
  return createError({
    status: 413,
    message: 'Event payload too large',
  })
}

function unreadablePayloadError() {
  return createError({
    status: 400,
    message: 'Event payload could not be read',
  })
}
