import { Router } from 'express'
import { homepageController } from '../controllers/homepage'

export const homepageRouter = Router()

homepageRouter.get('/', homepageController.get)
