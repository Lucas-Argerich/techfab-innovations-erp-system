import { Router } from 'express'
import {
  db,
  isAnyUndefined,
  isValidEmail,
  isValidEmployeeStatus,
  isValidPhoneNumber
} from '../utils/utils'
import { EmployeeStatus, type Employee } from '../types/db-types'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const employeesRouter = Router()

// Get all employee items
employeesRouter.get('/', (req, res) => {
  res.status(200).json(db.employees)
})

// Get a specific employee item by ID
employeesRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('employees') })
  }

  res.status(200).json(item)
})

// Create a new employee item
employeesRouter.post('/', (req, res) => {
  const { name, email, phone, position, status }: Employee = req.body

  if (isAnyUndefined(name, email, phone, position, status)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
    })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: ERROR_MESSAGES.INVALID_EMAIL() })
  }

  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({
      error: ERROR_MESSAGES.INVALID_PHONE()
    })
  }

  if (!isValidEmployeeStatus(status)) {
    return res
      .status(400)
      .json({ error: ERROR_MESSAGES.INVALID_STATUS('employees') })
  }

  const newItem: Employee = {
    id: db.employees.length + 1,
    name,
    email,
    phone,
    position,
    status
  }

  db.employees.push(newItem)

  res
    .status(201)
    .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('employees'), data: newItem })
})

// Update an existing employee item
employeesRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('employees') })
  }

  const { name, email, phone, position, status }: Employee = req.body

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
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_PHONE()
      })
    }
  }

  if (position !== undefined) {
    item.position = position
  }

  if (status !== undefined) {
    if (isValidEmployeeStatus(status)) {
      item.status = status
    } else {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('employees') })
    }
  }

  res
    .status(200)
    .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('employees'), data: item })
})

// Terminate a specific employee item by ID
employeesRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('employees') })
  }

  item.status = EmployeeStatus.Terminated

  res
    .status(200)
    .json({
      message: SUCCESS_MESSAGES.ITEM_DELETE(
        'employees',
        EmployeeStatus.Terminated
      )
    })
})
