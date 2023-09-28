import { type NextFunction, type Request, type Response } from 'express'
import { inventoryItemModel } from '../models/json/inventoryItem'
import {
  filterReqBody,
  isAnyUndefined,
  isValidInventoryStatus
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'

export const inventoryController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    inventoryItemModel
      .readAll()
      .then((inventory) => {
        res.status(200).json(inventory)
      })
      .catch(next)
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    inventoryItemModel
      .read(id)
      .then((inventoryItem) => {
        res.status(200).json(inventoryItem)
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const { name, category, quantity, price, status } = req.body

    if (isAnyUndefined(name, category, quantity, price, status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    if (!isValidInventoryStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('inventory')
      })
    }

    const input = { name, category, quantity, price, status }

    inventoryItemModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('inventory'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const { name, category, quantity, price, status } = req.body

    if (status !== undefined && !isValidInventoryStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('inventory')
      })
    }

    const input = filterReqBody({ name, category, quantity, price, status })

    inventoryItemModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('inventory'), data })
      })
      .catch(next)
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    inventoryItemModel
      .delete(id)
      .then(() => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('inventory') })
      })
      .catch(next)
  }
}
