import { type NextFunction, type Request, type Response } from 'express'
// import { orderModel } from '../models/json/order'
import orderModel from '../models/SQLServer/order'
import {
  filterReqBody,
  isAnyUndefined,
  isValidOrderStatus
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { type InputOrderItem, type InputOrder } from '../models/types'

export const ordersController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    orderModel
      .readAll()
      .then((orders) => {
        res.status(200).render('pages/orders/index', { orders })
      })
      .catch(next)
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    orderModel
      .read(id)
      .then((order) => {
        res.status(200).render('pages/orders/order', { order })
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const {
      customer_id: customerId,
      total_price: totalPrice,
      status
    }: InputOrder = req.body

    if (isAnyUndefined(totalPrice, status, customerId)) {
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
      customer_id: customerId,
      total_price: totalPrice,
      status
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

export const orderItemController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    const orderId = parseInt(req.params.id)

    orderModel.readAllOrderItems(orderId)
      .then((orderItems) => {
        res.status(200).json(orderItems)
      })
      .catch(next)
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    const orderId = parseInt(req.params.id)
    const itemId = parseInt(req.params.itemId)

    orderModel.readOrderItem(orderId, itemId)
      .then((order) => {
        res.status(200).json(order)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const orderId = parseInt(req.params.id)

    const { quantity, product_id: productId }: InputOrderItem = req.body

    if (isAnyUndefined(quantity, productId)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    const input = { quantity, product_id: productId }

    orderModel.createOrderItem(orderId, input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('orderItem'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const orderId = parseInt(req.params.id)
    const itemId = parseInt(req.params.itemId)

    const { quantity, product_id: productId }: Partial<InputOrderItem> = req.body

    const input = { quantity, product_id: productId }

    orderModel.updateOrderItem(orderId, itemId, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('orderItem'), data })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const orderId = parseInt(req.params.id)
    const itemId = parseInt(req.params.itemId)

    orderModel
      .deleteOrderItem(orderId, itemId)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('orderItem') })
      })
      .catch(next)
  }
}
