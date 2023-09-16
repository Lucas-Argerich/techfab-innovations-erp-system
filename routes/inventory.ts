import { Router, json } from 'express'
import db from '../db.json' assert { type: 'json' }

export const inventoryRouter = Router()

class InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
  constructor ({ name = '', category = '', quantity = 0, price = 0 }) {
    this.id = db.inventory.length + 1
    this.name = name
    this.category = category
    this.quantity = quantity
    this.price = price
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

  if (item === undefined) {
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
