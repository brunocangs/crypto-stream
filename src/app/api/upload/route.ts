import { scryptSync, createCipheriv, randomBytes } from "node:crypto"
import { constrainedMemory } from "node:process";

const key = scryptSync("password", "salt", 24);
const iv = randomBytes(16)


function padLength(num: number) {
  const buf = Buffer.alloc(4)
  buf.writeUInt32BE(num, 0)
  return buf
}


export async function POST(req: Request) {
  let cipher = createCipheriv('aes-192-cbc', key, iv)
  if (!req.body) return new Response('No body', { status: 400 })
  return new Response(
    req.body.pipeThrough(
      new TransformStream({
        start(controller) {
          // Primeros 16 bytes do arquivo são o IV
          controller.enqueue(iv)
        },
        transform(chunk, controller) {
          cipher = createCipheriv('aes-192-cbc', key, iv)
          // Cada bloco começa com 4 bytes contendo o tamanho do bloco
          const ciphered = Buffer.concat([cipher.update(chunk), cipher.final()])
          controller.enqueue(Buffer.concat([padLength(ciphered.length), ciphered]))
        },
        flush(controller) {
          /* const final = cipher.final()
          console.log("final", final.length)
          controller.enqueue(Buffer.concat([padLength(final.length), final])) */
        }
      })
    )
  )
}
