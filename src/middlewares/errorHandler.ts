import { type Request, type Response, type NextFunction } from 'express'
import { ERROR_MESSAGES } from '../constants/messages'
import { ItemNotFound, type ModelError } from '../constants/errors'

export const errorHandler = (
  err: ModelError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  switch (true) {
  case err instanceof ItemNotFound:
    return res
      .status(404)
      .json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND(err.typeName) })
  default:
    console.error('Unexpected error:', err)
    return res
      .status(500)
      .json({ error: ERROR_MESSAGES.FAILED_TO(err.typeName, err.method) })
  }
}
