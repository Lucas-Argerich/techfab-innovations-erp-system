const express = require('express')
const app = express()

const PORT = process.env.PORT | 3000

app.get('/', (req, res) => {
  console.log('request received:', req.url)
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
