import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controller'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-image',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadImageController)
)
mediasRouter.post(
  '/upload-video',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
)
export default mediasRouter
