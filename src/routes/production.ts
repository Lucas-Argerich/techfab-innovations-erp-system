import { Router } from 'express'
import {
  db,
  isAnyUndefined,
  isInInventory,
  isValidProductionItemStatus
} from '../utils/utils'
import { ProductionItemStatus, type ProductionItem } from '../types/db-types'

export const productionRouter = Router()

productionRouter.get('/', (req, res) => {
  res.status(200).json(db.production)
})

productionRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send({ error: 'Item not found in database.' })
  }

  res.status(200).json(item)
})

productionRouter.post('/', (req, res) => {
  const { product_id: productId, quantity, status }: ProductionItem = req.body

  if (isAnyUndefined(productId, quantity, status)) {
    return res.status(400).json({
      error: 'Invalid request body. Please provide all required fields.'
    })
  }

  if (!isValidProductionItemStatus(status)) {
    return res.status(400).json({
      error: 'Invalid status provided.'
    })
  }

  if (!isInInventory(productId)) {
    return res.status(400).json({
      error:
        'Invalid request. The specified product_id is not found in the inventory database.'
    })
  }

  const newItem: ProductionItem = {
    id: db.production.length + 1,
    product_id: productId,
    quantity,
    status
  }

  db.production.push(newItem)

  res.status(200).json({ message: 'Item created successfully', item: newItem })
})

productionRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  const { product_id: productId, quantity, status }: ProductionItem = req.body

  if (item === undefined) {
    return res.status(404).send({ error: 'Item not found in database.' })
  }

  if (productId !== undefined) {
    if (isInInventory(productId)) {
      item.product_id = productId
    } else {
      return res.status(400).json({
        error:
          'Invalid request. The specified product_id is not found in the inventory database.'
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
      return res.status(400).json({ error: 'Invalid status provided.' })
    }
  }

  res.status(200).json({ message: 'Item updated successfully', item })
})

productionRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.production.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send({ error: 'Item not found in database.' })
  }

  item.status = ProductionItemStatus.Cancelled

  res.status(200).json({ message: 'Item cancelled successfully' })
})
