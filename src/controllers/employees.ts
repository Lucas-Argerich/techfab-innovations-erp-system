import { type NextFunction, type Request, type Response } from 'express'
// import { employeeModel } from '../models/json/employee'
import employeeModel from '../models/SQLServer/employee'
import {
  filterReqBody,
  isAnyUndefined,
  isValidEmail,
  isValidEmployeeStatus,
  isValidPhoneNumber
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { type InputEmployee } from '../models/types'

export const employeesController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    employeeModel
      .readAll()
      .then((employees) => {
        res.status(200).json(employees)
      })
      .catch(next)
  },
  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)
    employeeModel
      .read(id)
      .then((employee) => {
        res.status(200).json(employee)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const { name, email, phone, position, status }: InputEmployee = req.body

    if (isAnyUndefined(name, email, phone, position, status)) {
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

    if (!isValidEmployeeStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('employee')
      })
    }

    const input = { name, email, phone, position, status }

    employeeModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('employee'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const { name, email, phone, position, status }: Partial<InputEmployee> = req.body

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_EMAIL() })
    }

    if (phone !== undefined && !isValidPhoneNumber(phone)) {
      return res.status(400).json({ error: ERROR_MESSAGES.INVALID_PHONE() })
    }

    if (status !== undefined && !isValidEmployeeStatus(status)) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('employee') })
    }

    const input = filterReqBody({ name, email, phone, position, status })

    employeeModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('employee'), data })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    employeeModel
      .delete(id)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('employee') })
      })
      .catch(next)
  }
}
