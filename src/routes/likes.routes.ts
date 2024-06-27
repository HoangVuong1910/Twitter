import { Router } from 'express'
import { likeTweetController, unlikeTweetController } from '~/controllers/likes.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const likesRoute = Router()

/**
 * Description: Like Tweet
 * Header: {Authorization: Bear <access_token> }
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 */

likesRoute.post(
  '/',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(tweetIdValidator),
  wrapRequestHandler(likeTweetController)
)

/**
 * Description: Unlike Tweet
 * Header: {Authorization: Bear <access_token> }
 * Path: /tweets/:tweet_id
 * Method: DELETE
 */

likesRoute.delete(
  '/tweets/:tweet_id',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(unlikeTweetController)
)

export default likesRoute
