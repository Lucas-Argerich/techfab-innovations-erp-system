import { Router, json } from 'express'
import { ordersController } from '../controllers/orders'
import { errorHandler } from '../middlewares/errorHandler'

export const ordersRouter = Router()

ordersRouter.use(json())

// Get all order items
ordersRouter.get('/', ordersController.getAll)

// Get a sepcific order by ID
ordersRouter.get('/:id', ordersController.getById)

// Create a new order item
ordersRouter.post('/', ordersController.post)

// Update an existing order item
ordersRouter.put('/:id', ordersController.put)

// Cancel a specific order item by ID
ordersRouter.delete('/:id', ordersController.delete)

ordersRouter.use(errorHandler)
