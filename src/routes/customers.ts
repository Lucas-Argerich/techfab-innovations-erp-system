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
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const customersRouter = Router()

// Get all customer items
customersRouter.get('/', (req, res) => {
  res.status(200).json(db.customers)
})

// Get a specific customer item by ID
customersRouter.get('/:id', (req, res) => {
  const customerId = parseInt(req.params.id)
  const customer = db.customers.find((customer) => customer.id === customerId)

  if (customer === undefined) {
    res.status(404).json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
  }

  res.status(200).json(customer)
})

// Create a new customer item
customersRouter.post('/', (req, res) => {
  const { name, email, phone, order_ids: orderIds, status }: Customer = req.body

  if (isAnyUndefined(name, email, phone, orderIds, status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
    })
  }

  if (!isValidCustomerStatus(status)) {
    return res
      .status(400)
      .json({ error: ERROR_MESSAGES.INVALID_STATUS('customers') })
  }

  if (!areAllInOrders(orderIds)) {
    return res
      .status(400)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
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

  res
    .status(201)
    .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('customers'), data })
})

// Update an existing customer item
customersRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.customers.find((item) => item.id === itemId)

  const { name, email, phone, order_ids: orderIds, status }: Customer = req.body

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
  }

  if (name !== undefined) {
    item.name = name
  }

  if (email !== undefined) {
    if (isValidEmail(email)) {
      item.email = email
    } else {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_EMAIL() })
    }
  }

  if (phone !== undefined) {
    if (isValidPhoneNumber(phone)) {
      item.phone = phone
    } else {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PHONE() })
    }
  }

  if (orderIds !== undefined) {
    if (areAllInOrders(orderIds)) {
      item.order_ids = orderIds
    } else {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
    }
  }

  if (status !== undefined) {
    if (isValidCustomerStatus(status)) {
      item.status = status
    } else {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('customers') })
    }
  }

  res
    .status(200)
    .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('customers'), data: item })
})

// Archive a specific customer item by ID
customersRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.customers.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
  }

  item.status = CustomerStatus.Archived

  res
    .status(200)
    .json({
      message: SUCCESS_MESSAGES.ITEM_DELETE(
        'customers',
        CustomerStatus.Archived
      )
    })
})
