import { Router, json } from 'express'
import { type InventoryItem } from '../types/db-types'
import { db, isAnyUndefined, isValidInventoryStatus } from '../utils/utils'

export const inventoryRouter = Router()

inventoryRouter.use(json())

// Get all inventory items
inventoryRouter.get('/', (req, res) => {
  res.json(db.inventory)
})

// Get a specific inventory item by ID
inventoryRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send(new Error('Item not found in database.'))
  }

  res.json(item)
})

// Create a new inventory item
inventoryRouter.post('/', (req, res) => {
  const { name, category, quantity, price, status }: InventoryItem = req.body

  if (isAnyUndefined(name, category, quantity, price, status)) {
    return res.status(400).json({
      error: 'Invalid request body. Please provide all required fields.'
    })
  }

  if (!isValidInventoryStatus(status)) {
    return res.status(400).json({
      error: 'Invalid status provided.'
    })
  }

  const item: InventoryItem = {
    id: db.inventory.length + 1,
    name,
    category,
    quantity,
    price,
    status
  }

  db.inventory.push(item)

  res.status(201).json({ message: 'Item created successfully', item })
})

// Update an existing inventory item
inventoryRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send(new Error('Item not found in database.'))
  }

  if (req.body.name !== undefined) {
    item.name = req.body.name
  }

  if (req.body.category !== undefined) {
    item.category = req.body.category
  }

  if (req.body.quantity !== undefined) {
    item.quantity = req.body.quantity
  }

  if (req.body.price !== undefined) {
    item.price = req.body.price
  }

  res.status(200).json({ message: 'Item updated successfully', item })
})

// Delete a specific inventory item by ID
inventoryRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const index = db.inventory.findIndex((item) => item.id === itemId)

  if (index === -1) {
    return res.status(404).send(new Error('Item not found in database.'))
  }

  db.inventory.splice(index, 1)

  res.status(200).json({ message: 'Item deleted successfully' })
})
