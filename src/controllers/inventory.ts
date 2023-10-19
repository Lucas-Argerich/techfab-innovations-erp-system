import { type NextFunction, type Request, type Response } from 'express'
// import { inventoryItemModel } from '../models/json/inventoryItem'
import inventoryItemModel from '../models/SQLServer/inventoryItem'
import {
  filterReqBody,
  isAnyUndefined,
  isValidInventoryStatus
} from '../utils/utils'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages'
import { type InputInventoryItem } from '../models/types'

export const inventoryController = {
  getAll: (req: Request, res: Response, next: NextFunction) => {
    inventoryItemModel
      .readAll()
      .then((inventory) => {
        res.status(200).render('pages/inventory/index', { inventory })
      })
      .catch(next)
  },
  get: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    inventoryItemModel
      .read(id)
      .then((inventoryItem) => {
        res.status(200).render('pages/inventory/inventoryItem', { inventoryItem })
      })
      .catch(next)
  },
  post: (req: Request, res: Response, next: NextFunction) => {
    const { name, category, quantity, price, status }: InputInventoryItem = req.body

    if (isAnyUndefined(name, category, quantity, price, status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_REQUEST_BODY()
      })
    }

    if (!isValidInventoryStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('inventoryItem')
      })
    }

    const input = { name, category, quantity, price, status }

    inventoryItemModel
      .create(input)
      .then((data) => {
        res
          .status(201)
          .json({ message: SUCCESS_MESSAGES.ITEM_CREATE('inventoryItem'), data })
      })
      .catch(next)
  },
  put: (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    const { name, category, quantity, price, status }: Partial<InputInventoryItem> = req.body

    if (status !== undefined && !isValidInventoryStatus(status)) {
      return res.status(400).json({
        error: ERROR_MESSAGES.INVALID_STATUS('inventoryItem')
      })
    }

    const input = filterReqBody({ name, category, quantity, price, status })

    inventoryItemModel
      .update(id, input)
      .then((data) => {
        res
          .status(200)
          .json({ message: SUCCESS_MESSAGES.ITEM_UPDATE('inventoryItem'), data })
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
          .json({ message: SUCCESS_MESSAGES.ITEM_DELETE('inventoryItem') })
      })
      .catch(next)
  }
}
