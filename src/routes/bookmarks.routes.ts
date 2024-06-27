import { Router } from 'express'
import { bookmarkTweetController, unbookmarkTweetController } from '~/controllers/bookmarks.controller'
import { tweetIdValidator } from '~/middlewares/tweets.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'
import { validate } from '~/utils/validation'

const bookmarksRoute = Router()

/**
 * Description: Bookmark Tweet
 * Header: {Authorization: Bear <access_token> }
 * Path: /
 * Method: POST
 * Body: {tweet_id: string}
 */

bookmarksRoute.post(
  '/',
  validate(accessTokenValidator),
  verifiedUserValidator,
  validate(tweetIdValidator),
  wrapRequestHandler(bookmarkTweetController)
)

/**
 * Description: Unbookmark Tweet
 * Header: {Authorization: Bear <access_token> }
 * Path: /tweets/:tweet_id
 * Method: DELETE
 */

bookmarksRoute.delete(
  '/tweets/:tweet_id',
  validate(accessTokenValidator),
  verifiedUserValidator,
  wrapRequestHandler(unbookmarkTweetController)
)

export default bookmarksRoute
