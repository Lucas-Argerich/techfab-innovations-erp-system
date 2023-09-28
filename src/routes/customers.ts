import { Router, json } from 'express'
import { customersController } from '../controllers/customers'
import { errorHandler } from '../middlewares/errorHandler'

export const customersRouter = Router()

customersRouter.use(json())

// Get all customer items
customersRouter.get('/', customersController.getAll)

// Get a specific customer item by ID
customersRouter.get('/:id', customersController.getById)

// Create a new customer item
customersRouter.post('/', customersController.post)

// Update an existing customer item
customersRouter.put('/:id', customersController.put)

// Delete a specific customer item by ID
customersRouter.delete('/:id', customersController.delete)

customersRouter.use(errorHandler)
