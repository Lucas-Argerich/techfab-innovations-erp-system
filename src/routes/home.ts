import { Router } from 'express'
import { homeController } from '../controllers/home'

export const homeRouter = Router()

homeRouter.get('/', homeController.get)
