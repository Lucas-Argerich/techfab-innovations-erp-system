import express from 'express'
import path from 'node:path'
import { corsMiddleware } from './middlewares/cors'
import { inventoryRouter } from './routes/inventory'
import { ordersRouter } from './routes/orders'
import { productionRouter } from './routes/production'
import { customersRouter } from './routes/customers'
import { employeesRouter } from './routes/employees'

// Configuration
const app = express()
app.disable('x-powered-by')

// ejs config
app.set('view engine', 'ejs')
app.set('views', 'src/views')

// Middleware
app.use(express.static(path.join(__dirname, 'public')))
app.use(corsMiddleware())

// Routes
app.use('/inventory', inventoryRouter)
app.use('/orders', ordersRouter)
app.use('/production', productionRouter)
app.use('/customers', customersRouter)
app.use('/employees', employeesRouter)

// Deploy
const PORT = process.env.PORT ?? 3000
app.listen(PORT, () => {
  console.log(`server listening on port http://localhost:${PORT}`)
})
