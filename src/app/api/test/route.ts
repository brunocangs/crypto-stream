export async function POST(req: Request) {
   return new Response(await fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: await req.arrayBuffer() 
    })

      .then(async res => fetch("http://localhost:3000/api/decrypt", {
        method: "POST",
        body: await res.arrayBuffer()
      })
      )
      .then(res => res.body))
}
