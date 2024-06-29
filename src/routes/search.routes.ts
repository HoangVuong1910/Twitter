import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const searchRouter = Router()

searchRouter.get(
  '/',
  validate(paginationValidator),
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(searchValidator),
  wrapRequestHandler(searchController)
)

export default searchRouter
