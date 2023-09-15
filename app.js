const http = require('node:http')

const desiredPort = process.env.desiredPort | 3000

const server = http.createServer((req, res) => {
  console.log('request received:', req.url)
  res.end('Hello World!')
})

server.listen(desiredPort, () => {
  console.log(`server listening on port http://localhost:${desiredPort}`)
})
