import { Router, json } from 'express'
import { employeesController } from '../controllers/employees'
import { errorHandler } from '../middlewares/errorHandler'

export const employeesRouter = Router()

employeesRouter.use(json())

// Get all employee items
employeesRouter.get('/', employeesController.getAll)

// Get a specific employee item by ID
employeesRouter.get('/:id', employeesController.get)

// Create a new employee item
employeesRouter.post('/', employeesController.post)

// Update an existing employee item
employeesRouter.put('/:id', employeesController.put)

// Delete a specific employee item by ID
employeesRouter.delete('/:id', employeesController.delete)

employeesRouter.use(errorHandler)
