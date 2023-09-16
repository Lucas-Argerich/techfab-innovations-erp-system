import express from 'express'
import { inventoryRouter } from './routes/inventory'
import { corsMiddleware } from './middlewares/cors'

// Configuration
const app = express()
app.disable('x-powered-by')

// Middleware
app.use(corsMiddleware())

// Routes
app.use('/inventory', inventoryRouter)

// Deploy
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
