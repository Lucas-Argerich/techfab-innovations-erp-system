import { type NextFunction, type Request, type Response } from 'express'
import { orderModel } from '../models/json/order'
import {
  filterReqBody,
  isAnyUndefined,
  isValidOrderStatus
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const ordersController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    orderModel
      .readAll()
      .then((orders) => {
        res.status(200).json(orders)
      })
      .catch(next)
  },
  getById: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    orderModel
      .read(id)
      .then((order) => {
        res.status(200).json(order)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const {
      customer_id: customerId,
      products,
      total_price: totalPrice,
      status
    } = req.body

    if (isAnyUndefined(customerId, products, totalPrice, status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    if (!isValidOrderStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('orders')
      })
    }

    const input = {
      customer_id: customerId,
      products,
      total_price: totalPrice,
      status
    }

    orderModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('orders'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const {
      customer_id: customerId,
      products,
      total_price: totalPrice,
      status
    } = req.body

    if (status !== undefined && !isValidOrderStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('orders')
      })
    }

    const input = filterReqBody({
      customer_id: customerId,
      products,
      total_price: totalPrice,
      status
    })

    orderModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('orders'), data })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    orderModel
      .delete(id)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('orders') })
      })
      .catch(next)
  }
}
