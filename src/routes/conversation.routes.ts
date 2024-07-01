import { Router } from 'express'
import { getConversationsController } from '~/controllers/conversations.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const conversationsRouter = Router()

conversationsRouter.get(
  '/receivers/:receiver_id',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(getConversationsController)
)

export default conversationsRouter
