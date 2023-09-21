import { Router } from 'express'
import {
  areAllInOrders,
  db,
  isAnyUndefined,
  isValidCustomerStatus,
  isValidEmail,
  isValidPhoneNumber
} from '../utils/utils'
import { CustomerStatus, type Customer } from '../types/db-types'

export const customersRouter = Router()

customersRouter.get('/', (req, res) => {
  res.status(200).json(db.customers)
})

customersRouter.get('/:id', (req, res) => {
  const customerId = parseInt(req.params.id)
  const customer = db.customers.find((customer) => customer.id === customerId)

  if (customer === undefined) {
    res.status(404).json({ error: 'Customer not found in database.' })
  }

  res.status(200).json(customer)
})

customersRouter.post('/', (req, res) => {
  const { name, email, phone, order_ids: orderIds, status }: Customer = req.body

  if (isAnyUndefined(name, email, phone, orderIds, status)) {
    return res.status(400).json({
      error: 'Invalid request body. Please provide all required fields.'
    })
  }

  if (!isValidCustomerStatus(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' })
  }

  if (!areAllInOrders(orderIds)) {
    return res.status(400).json({ error: 'Invalid order ID in order_ids.' })
  }

  const data = {
    id: db.customers.length + 1,
    name,
    email,
    phone,
    order_ids: orderIds,
    status
  }

  db.customers.push(data)

  res.status(201).json({ message: 'Customer data created successfully.', data })
})

customersRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.customers.find((item) => item.id === itemId)

  const { name, email, phone, order_ids: orderIds, status }: Customer = req.body

  if (item === undefined) {
    return res.status(404).json({ error: 'Customer not found in database.' })
  }

  if (name !== undefined) {
    item.name = name
  }

  if (email !== undefined) {
    if (isValidEmail(email)) {
      item.email = email
    } else {
      return res.status(400).json({ error: 'Invalid email address provided.' })
    }
  }

  if (phone !== undefined) {
    if (isValidPhoneNumber(phone)) {
      item.phone = phone
    } else {
      return res.status(400).json({ error: 'Invalid phone number provided.' })
    }
  }

  if (orderIds !== undefined) {
    if (areAllInOrders(orderIds)) {
      item.order_ids = orderIds
    } else {
      return res.status(400).json({ error: 'Invalid order ID in order_ids.' })
    }
  }

  if (status !== undefined) {
    if (isValidCustomerStatus(status)) {
      item.status = status
    } else {
      return res.status(400).json({ error: 'Invalid status provided.' })
    }
  }

  res.status(200).json({ message: 'Customer data updated successfully.', data: item })
})

customersRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.customers.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).json({ error: 'Customer not found in database.' })
  }

  item.status = CustomerStatus.Archived

  res.status(200).json({ message: 'Customer archived successfully.' })
})
