import { type NextFunction, type Request, type Response } from 'express'

export const homeController = {
  get: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).render('pages/home/index')
    } catch (err) {
      next(err)
    }
  }
}
