import { type NextFunction, type Request, type Response } from 'express'
// import { orderModel } from '../models/json/order'
import orderModel from '../models/SQLServer/order'
import {
  filterReqBody,
  isAnyUndefined,
  isValidOrderStatus
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { type InputOrder } from '../models/types'

// Should handle the order product addition with other method/route

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
      products,
      total_price: totalPrice,
      status,
      customer_id: customerId
    }: InputOrder = req.body

    if (isAnyUndefined(products, totalPrice, status, customerId)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    if (!isValidOrderStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('order')
      })
    }

    const input = {
      products,
      total_price: totalPrice,
      status,
      customer_id: customerId
    }

    orderModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('order'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const {
      products,
      total_price: totalPrice,
      status,
      customer_id: customerId
    }: Partial<InputOrder> = req.body

    if (status !== undefined && !isValidOrderStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('order')
      })
    }

    const input = filterReqBody({
      products,
      total_price: totalPrice,
      status,
      customer_id: customerId
    })

    orderModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('order'), data })
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
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('order') })
      })
      .catch(next)
  }
}
