import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TWEETS_MESSAGES } from '~/constants/messages'
import { Pagination, TweetRequestBody } from '~/models/requests/Tweet.requests'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsService.createTweet(user_id, req.body)
  return res.json({
    message: 'Create tweet Successfully',
    result: result
  })
}

export const getTweetController = async (req: Request, res: Response, next: NextFunction) => {
  // không nên xử lý query ở đây vì trước đó validator đã query 1 lần
  // const tweet = await tweetsService.getTweet(tweet_id)
  const tweet_id = req.params.tweet_id
  const user_id = req.decoded_authorization?.user_id
  const result = await tweetsService.increaseTweet(tweet_id, user_id)
  const tweet = {
    ...req.tweet,
    guest_views: result?.guest_views,
    user_views: result?.user_views
  }
  return res.json({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: tweet
  })
}

export const getNewFeedsController = async (
  req: Request<ParamsDictionary, any, any, Pagination>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await tweetsService.getNewFeeds({ user_id, limit, page })
  return res.json({
    message: TWEETS_MESSAGES.GET_NEW_FEEDS_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
