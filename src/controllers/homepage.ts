import { type NextFunction, type Request, type Response } from 'express'

export const homepageController = {
  get: (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).render('pages/homepage/index')
    } catch (err) {
      next(err)
    }
  }
}
