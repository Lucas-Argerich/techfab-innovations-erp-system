import { type NextFunction, type Request, type Response } from 'express'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
// import { customerModel } from '../models/json/customer'
import customerModel from '../models/SQLServer/customer'
import {
  filterReqBody,
  isAnyUndefined,
  isValidCustomerStatus,
  isValidEmail,
  isValidPhoneNumber
} from '../utils/utils'
import { type InputCustomer } from '../models/types'

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
    const { name, email, phone, status }: InputCustomer = req.body

    if (isAnyUndefined(name, email, phone, status)) {
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
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('customer') })
    }

    const input = { name, email, phone, status }

    customerModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('customer'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const { name, email, phone, status }: Partial<InputCustomer> = req.body

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_EMAIL() })
    }

    if (phone !== undefined && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PHONE() })
    }

    if (status !== undefined && !isValidCustomerStatus(status)) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('customer') })
    }

    const input = filterReqBody({
      name,
      email,
      phone,
      status
    })

    customerModel
      .update(id, input)
      .then((data) => {
        res.status(200).json({
          message: SUCCESS_MESSAGES.ITEM_UPDATE('customer'),
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
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('customer') })
      })
      .catch(next)
  }
}
