import { Router, json } from 'express'
import { inventoryController } from '../controllers/inventory'
import { errorHandler } from '../middlewares/errorHandler'

export const inventoryRouter = Router()

inventoryRouter.use(json())

// Get all inventory items
inventoryRouter.get('/', inventoryController.getAll)

// Get a specific inventory item by ID
inventoryRouter.get('/:id', inventoryController.get)

// Create a new inventory item
inventoryRouter.post('/', inventoryController.post)

// Update an existing inventory item
inventoryRouter.put('/:id', inventoryController.put)

// Delete a specific inventory item by ID
inventoryRouter.delete('/:id', inventoryController.delete)

inventoryRouter.use(errorHandler)
