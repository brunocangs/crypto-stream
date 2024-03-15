import { Decipher, createDecipheriv, scryptSync } from "node:crypto";

const key = scryptSync("password", "salt", 24);

function parseBlockLength(num: Uint8Array) {
  console.log("decrypt", Buffer.from(num).toString("hex"))
  return Buffer.from(num).readUInt32BE()
}

export async function POST(req: Request) {
  let blockSize = -1
  let buffer: Uint8Array | undefined
  let cipher: Decipher | undefined
  let iv: Uint8Array | undefined
  if (!req.body) return new Response('No body', { status: 400 })

  return new Response(
    req.body.pipeThrough(
      // Generate blocks pipe
      new TransformStream({
        async transform(chunk, controller) {
          // If it's the first block, extract IV
          if (!buffer) {
            iv = chunk.slice(0, 16)
            buffer = chunk.slice(16)
            if (!buffer || buffer.length === 0) {
              throw new Error("Something went terribly wrong")
            }
          } else {
            // Accumulate
            buffer = Buffer.concat([buffer, chunk])
          }
          if (blockSize === -1) {
            // If we dont know the block size, try to parse it
            blockSize = parseBlockLength(buffer.slice(0, 4))
            buffer = buffer.slice(4)
          }
          if (buffer.length >= blockSize) {
            // If we do, once there's enough data, send it to next step
            const block = buffer.slice(0, blockSize)
            buffer = buffer.slice(blockSize)
            blockSize = -1
            controller.enqueue(block)
            console.log("decrypt", blockSize, buffer.length)
          }
        },
        flush(controller) {
          console.log("flush", buffer?.length)
          if (buffer?.length && buffer.length > 0) {
            controller.enqueue(buffer.slice(4))
          }
        }
      })).pipeThrough(
        // Decrypt pipe
        new TransformStream({
          transform(chunk, controller) {
            cipher = createDecipheriv('aes-192-cbc', key, iv!)
            const segment = cipher.update(chunk)
            controller.enqueue(Buffer.concat([segment, cipher.final()]))
          }
        })))
}
