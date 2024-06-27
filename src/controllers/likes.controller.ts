import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { BOOKMARKS_MESSAGES, LIKES_MESSAGES } from '~/constants/messages'
import { BookmarkTweetRequestBody } from '~/models/requests/Bookmark.requests'
import { LikeTweetRequestBody } from '~/models/requests/Like.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import bookmarksService from '~/services/bookmarks.services'
import likesService from '~/services/likes.services'

export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeTweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await likesService.likeTweet(user_id, req.body.tweet_id)
  return res.json({
    message: LIKES_MESSAGES.LIKE_TWEET_SUCCESSFULLY,
    result: result
  })
}

export const unlikeTweetController = async (req: Request, res: Response, next: NextFunction) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await likesService.unlikeTweet(user_id, req.params.tweet_id)
  return res.json({
    message: LIKES_MESSAGES.UNLIKE_TWEET_SUCCESSFULLY
  })
}
