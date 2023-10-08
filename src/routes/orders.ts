import { Router, json } from 'express'
import { orderItemController, ordersController } from '../controllers/orders'
import { errorHandler } from '../middlewares/errorHandler'

export const ordersRouter = Router()

ordersRouter.use(json())

// Get all order items
ordersRouter.get('/', ordersController.getAll)

// Get a sepcific order by ID
ordersRouter.get('/:id', ordersController.getById)

// Create a new order item
ordersRouter.post('/', ordersController.post)

// Update an existing order
ordersRouter.put('/:id', ordersController.put)

// Delete a specific order by ID
ordersRouter.delete('/:id', ordersController.delete)

// Get all the items of an order
ordersRouter.get('/:id/items', orderItemController.getAll)

// Get a sepcific item of an order by ID
ordersRouter.get('/:id/items/:itemId', orderItemController.getById)

// Create a new item of an order
ordersRouter.post('/:id/items', orderItemController.post)

// Update an existing item of an order
ordersRouter.put('/:id/items/:itemId', orderItemController.put)

// Delete a specific item of an order by ID
ordersRouter.delete('/:id/items/:itemId', orderItemController.delete)

ordersRouter.use(errorHandler)
