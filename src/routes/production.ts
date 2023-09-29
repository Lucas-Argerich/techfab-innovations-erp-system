import { Router, json } from 'express'
import { productionController } from '../controllers/production'
import { errorHandler } from '../middlewares/errorHandler'

export const productionRouter = Router()

productionRouter.use(json())

// Get all production items
productionRouter.get('/', productionController.getAll)

// Get a specific production item by ID
productionRouter.get('/:id', productionController.get)

// Create a new production item
productionRouter.post('/', productionController.post)

// Update an existing production item
productionRouter.put('/:id', productionController.put)

// Cancel a specific production item by ID
productionRouter.delete('/:id', productionController.delete)

productionRouter.use(errorHandler)
