import { Router, json } from 'express'
import {
  db,
  isAnyUndefined,
  isInInventory,
  isValidProductionItemStatus
} from '../utils/utils'
import { ProductionItemStatus, type ProductionItem } from '../types/db-types'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const productionRouter = Router()

productionRouter.use(json())

// Get all production items
productionRouter.get('/', (req, res) => {
  res.status(200).json(db.production)
})

// Get a specific production item by ID
productionRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .send({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('production') })
  }

  res.status(200).json(item)
})

// Create a new production item
productionRouter.post('/', (req, res) => {
  const { product_id: productId, quantity, status }: ProductionItem = req.body

  if (isAnyUndefined(productId, quantity, status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
    })
  }

  if (!isValidProductionItemStatus(status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_STATUS('production')
    })
  }

  if (!isInInventory(productId)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.ITEM_NOT_FOUND('production')
    })
  }

  const newItem: ProductionItem = {
    id: db.production.length + 1,
    product_id: productId,
    quantity,
    status
  }

  db.production.push(newItem)

  res.status(200).json({
    message: SUCCESS_MESSAGES.ITEM_CREATE('production'),
    item: newItem
  })
})

// Update an existing production item
productionRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  const { product_id: productId, quantity, status }: ProductionItem = req.body

  if (item === undefined) {
    return res
      .status(404)
      .send({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('production') })
  }

  if (productId !== undefined) {
    if (isInInventory(productId)) {
      item.product_id = productId
    } else {
      return res.status(400).json({
        error: ERROR_MESSAGES.ITEM_NOT_FOUND('production')
      })
    }
  }

  if (quantity !== undefined) {
    item.quantity = quantity
  }

  if (status !== undefined) {
    if (isValidProductionItemStatus(status)) {
      item.status = status
    } else {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('production') })
    }
  }

  res
    .status(200)
    .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('production'), item })
})

// Cancel a specific production item by ID
productionRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .send({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('production') })
  }

  item.status = ProductionItemStatus.Cancelled

  res
    .status(200)
    .json({
      message: SUCCESS_MESSAGES.ITEM_DELETE(
        'production',
        ProductionItemStatus.Cancelled
      )
    })
})
