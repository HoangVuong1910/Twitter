import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controller'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const tweetsRouter = Router()

/**
 * Description: Create tweet
 * Path: /
 * Method: POST
 * Body: TweetRequestBody
 * Header: {Authorization: Bear <access_token>}
 */
tweetsRouter.post(
  '/',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(createTweetValidator),
  wrapRequestHandler(createTweetController)
)

/**
 * Description: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: {Authorization?: Bear <access_token>}
 */
tweetsRouter.get(
  '/:tweet_id',
  validate(tweetIdValidator),
  isUserLoggedInValidator(validate(accessTokenValidator)),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(audienceValidator),
  wrapRequestHandler(getTweetController)
)

export default tweetsRouter
