import express from 'express'

const app = express()
app.disable('x-powered-by')

app.get('/', (req, res) => {
  console.log('request received:', req.url)
  res.json({ message: 'Hello World!' })
})

const PORT = process.env.PORT | 3000
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
