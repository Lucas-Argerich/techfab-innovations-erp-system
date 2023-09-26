import { Router, json } from 'express'
import { db, isAnyUndefined, isValidOrderStatus } from '../utils/utils'
import { OrderStatus, type Order } from '../types/db-types'

export const ordersRouter = Router()

ordersRouter.use(json())

// Get all order items
ordersRouter.get('/', (req, res) => {
  res.json(db.orders)
})

// Get a sepcific order by ID
ordersRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.orders.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).json({ error: 'Order not found in database.' })
  }

  res.json(item)
})

// Create a new order item
ordersRouter.post('/', (req, res) => {
  const {
    customer_id: customerId,
    products,
    total_price: totalPrice,
    status
  }: Order = req.body

  if (isAnyUndefined(customerId, products, totalPrice, status)) {
    return res.status(400).json({
      error: 'Invalid request body. Please provide all required fields.'
    })
  }

  if (!isValidOrderStatus(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' })
  }

  const order: Order = {
    id: db.orders.length + 1,
    customer_id: customerId,
    products,
    total_price: totalPrice,
    status
  }

  db.orders.push(order)

  res.status(201).json({ message: 'Order created successfully', order })
})

// Update an existing order item
ordersRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.orders.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send({ error: 'Order not found in database.' })
  }

  if (req.body.customer_id !== undefined) {
    item.customer_id = req.body.customer_id
  }

  if (req.body.products !== undefined) {
    item.products = req.body.products
  }

  if (req.body.total_price !== undefined) {
    item.total_price = req.body.total_price
  }

  if (req.body.status !== undefined) {
    if (isValidOrderStatus(req.body.status)) {
      item.status = req.body.status
    } else {
      return res.status(400).json({ error: 'Invalid status provided.' })
    }
  }

  res.status(200).json({ message: 'Order updated successfully', order: item })
})

// Cancel a specific order item by ID
ordersRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.orders.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).send({ error: 'Order not found in database.' })
  }

  item.status = OrderStatus.Cancelled

  res.status(200).json({ message: 'Order marked as cancelled successfully' })
})
