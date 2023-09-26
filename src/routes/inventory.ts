import { Router, json } from 'express'
import { InventoryItemStatus, type InventoryItem } from '../types/db-types'
import { db, isAnyUndefined, isValidInventoryStatus } from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const inventoryRouter = Router()

inventoryRouter.use(json())

// Get all inventory items
inventoryRouter.get('/', (req, res) => {
  res.status(200).json(db.inventory)
})

// Get a specific inventory item by ID
inventoryRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('inventory') })
  }

  res.status(200).json(item)
})

// Create a new inventory item
inventoryRouter.post('/', (req, res) => {
  const { name, category, quantity, price, status }: InventoryItem = req.body

  if (isAnyUndefined(name, category, quantity, price, status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
    })
  }

  if (!isValidInventoryStatus(status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_STATUS('inventory')
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

  res
    .status(201)
    .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('inventory'), item })
})

// Update an existing inventory item
inventoryRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .send({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('inventory') })
  }

  console.log('Body:', req.body)

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

  if (req.body.status !== undefined) {
    if (isValidInventoryStatus(req.body.status)) {
      item.status = req.body.status
    } else {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('inventory')
      })
    }
  }

  res
    .status(200)
    .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('inventory'), item })
})

// Discontinue a specific inventory item by ID
inventoryRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.inventory.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .send({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('inventory') })
  }

  item.status = InventoryItemStatus.Discontinued

  res.status(200).json({
    message: SUCCESS_MESSAGES.ITEM_DELETE(
      'inventory',
      InventoryItemStatus.Discontinued
    )
  })
})
