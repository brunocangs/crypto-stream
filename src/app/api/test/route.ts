export async function POST(req: Request) {
   return new Response(await fetch(`https://crypto-stream.vercel.app/api/upload`, {
      method: "POST",
      body: await req.arrayBuffer() 
    })

      .then(async res => fetch(`https://crypto-stream.vercel.app/api/decrypt`, {
        method: "POST",
        body: await res.arrayBuffer()
      })
      )
      .then(res => res.body))
}
