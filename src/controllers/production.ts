import { type NextFunction, type Request, type Response } from 'express'
import { productionItemModel } from '../models/json/productionItem'
import { filterReqBody, isValidProductionItemStatus } from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const productionController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    productionItemModel
      .readAll()
      .then((production) => {
        res.status(200).json(production)
      })
      .catch(next)
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    productionItemModel
      .read(id)
      .then((productionItem) => {
        res.status(200).json(productionItem)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const { product_id: productId, quantity, status } = req.body

    if (!isValidProductionItemStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('production')
      })
    }

    const input = { product_id: productId, quantity, status }

    productionItemModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('production'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const { product_id: productId, quantity, status } = req.body

    if (status !== undefined && !isValidProductionItemStatus(status)) {
      return res
        .status(400)
        .json({ error: ERROR_MESSAGES.INVALID_STATUS('production') })
    }

    const input = filterReqBody({ product_id: productId, quantity, status })

    productionItemModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('production'), data })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    productionItemModel
      .delete(id)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('production') })
      })
      .catch(next)
  }
}
