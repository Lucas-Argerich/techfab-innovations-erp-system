import express from 'express'
import { corsMiddleware } from './middlewares/cors'
import { inventoryRouter } from './routes/inventory'

// Configuration
const app = express()
app.disable('x-powered-by')

// Middleware
app.use(corsMiddleware())

// Routes
app.use('/inventory', inventoryRouter)

// Deploy
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
