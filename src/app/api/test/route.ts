export async function POST(req: Request) {
   return new Response(await fetch(`${process.env.VERCEL_URL}/api/upload`, {
      method: "POST",
      body: await req.arrayBuffer() 
    })

      .then(async res => fetch(`${process.env.VERCEL_URL}/api/decrypt`, {
        method: "POST",
        body: await res.arrayBuffer()
      })
      )
      .then(res => res.body))
}
