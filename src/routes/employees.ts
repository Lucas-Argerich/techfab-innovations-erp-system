import { Router } from 'express'
import {
  db,
  isAnyUndefined,
  isValidEmail,
  isValidEmployeeStatus,
  isValidPhoneNumber
} from '../utils/utils'
import { EmployeeStatus, type Employee } from '../types/db-types'

export const employeesRouter = Router()

employeesRouter.get('/', (req, res) => {
  res.status(200).json(db.employees)
})

employeesRouter.get('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).json({ error: 'Item not found in database.' })
  }

  res.status(200).json(item)
})

employeesRouter.post('/', (req, res) => {
  const { name, email, phone, position, status }: Employee = req.body

  if (isAnyUndefined(name, email, phone, position, status)) {
    return res.status(400).json({
      error: 'Invalid request body. Please provide all required fields.'
    })
  }

  if (!isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: 'Invalid email address. Please provide a valid email.' })
  }

  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({
      error: 'Invalid phone number. Please provide a valid phone number.'
    })
  }

  if (!isValidEmployeeStatus(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' })
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
    .json({ message: 'Employee data created successfully.', data: newItem })
})

employeesRouter.put('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).json({ error: 'Item not found in database.' })
  }

  const { name, email, phone, position, status }: Employee = req.body

  if (name !== undefined) {
    item.name = name
  }

  if (email !== undefined) {
    if (isValidEmail(email)) {
      item.email = email
    } else {
      return res.status(400).json({ error: 'Invalid email address.' })
    }
  }

  if (phone !== undefined) {
    if (isValidPhoneNumber(phone)) {
      item.phone = phone
    } else {
      return res.status(400).json({
        error: 'Invalid phone number.'
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
      return res.status(400).json({ error: 'Invalid status provided.' })
    }
  }

  res.status(200).json({ message: 'Employee data updated successfully.', data: item })
})

employeesRouter.delete('/:id', (req, res) => {
  const itemId = parseInt(req.params.id)
  const item = db.employees.find((item) => item.id === itemId)

  if (item === undefined) {
    return res.status(404).json({ error: 'Item not found in database.' })
  }

  item.status = EmployeeStatus.Terminated

  res.status(200).json({ message: 'Employee terminated successfully.' })
})

// TODO: Remember to standardize all error messages in all the routes
