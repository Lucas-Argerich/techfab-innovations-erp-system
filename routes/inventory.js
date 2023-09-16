import { Router, json } from 'express'
import db from '../db.json' assert { type: 'json' }

export const inventoryRouter = Router()

class InventoryItem {
  constructor ({ name, category, quantity, price }) {
    this.id = db.inventory.length + 1
    this.name = name || null
    this.category = category || null
    this.quantity = quantity || null
    this.price = price || null
  }
}

inventoryRouter.use(json())

// Get all inventory items
inventoryRouter.get('/', (req, res) => {
  res.json(db.inventory)
})

// Get a specific inventory item by ID
inventoryRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (!item) {
    return res.status(404).send(new Error('Item not found in database.'))
  }

  res.json(db.inventory.find((item) => item.id === itemId))
})

// Create a new inventory item:
inventoryRouter.post('/', (req, res) => {
  const item = new InventoryItem(req.body)
  db.inventory.push(item)
  res.status(200).json({ message: 'Item created successfully', item })
})

// Update an existing inventory item:
inventoryRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (!item) {
    return res.status(404).send(new Error('Item not found in database.'))
  }

  if (req.body.name) {
    item.body = req.body.name
  }

  if (req.body.category) {
    item.category = req.body.category
  }

  if (req.body.quantity) {
    item.quantity = req.body.quantity
  }

  if (req.body.price) {
    item.price = req.body.price
  }

  res.status(200).json({ message: 'Item updated successfully', item })
})
