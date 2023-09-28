import { type NextFunction, type Request, type Response } from 'express'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { customerModel } from '../models/customer'
import {
  areAllInOrders,
  filterReqBody,
  isAnyUndefined,
  isValidCustomerStatus,
  isValidEmail,
  isValidPhoneNumber
} from '../utils/utils'
import { type Customer } from '../types/db-types'

export const customersController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    customerModel
      .readAll()
      .then((customers) => {
        res.status(200).json(customers)
      })
      .catch(next)
  },
  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    customerModel
      .read(id)
      .then((customer) => {
        res.status(200).json(customer)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, order_ids: orderIds, status } = req.body

    if (isAnyUndefined(name, email, phone, orderIds, status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_EMAIL()
      })
    }

    if (!isValidPhoneNumber(phone)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_PHONE()
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

    const input = { name, email, phone, order_ids: orderIds, status }

    customerModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('customers'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const {
      name,
      email,
      phone,
      order_ids: orderIds,
      status
    }: Partial<Omit<Customer, 'id'>> = req.body

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_EMAIL() })
    }

    if (phone !== undefined && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PHONE() })
    }

    if (orderIds !== undefined && !areAllInOrders(orderIds)) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND('customers') })
    }

    if (status !== undefined && !isValidCustomerStatus(status)) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('customers') })
    }

    const input = filterReqBody({
      name,
      email,
      phone,
      order_ids: orderIds,
      status
    })

    customerModel
      .update(id, input)
      .then((data) => {
        res.status(200).json({
          message: SUCCESS_MESSAGES.ITEM_UPDATE('customers'),
          data
        })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    customerModel
      .delete(id)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('customers') })
      })
      .catch(next)
  }
}
