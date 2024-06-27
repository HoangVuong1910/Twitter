import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/commons'
import { NextFunction, Request, Response } from 'express'
import Tweet from '~/models/schemas/Tweet.schema'

const tweetTypes = numberEnumToArray(TweetType) //  [ 0, 1, 2, 3 ]
const tweetAudiences = numberEnumToArray(TweetAudience)
const mediaType = numberEnumToArray(MediaType)
export const createTweetValidator = checkSchema({
  type: {
    isIn: {
      options: [tweetTypes],
      errorMessage: TWEETS_MESSAGES.INVALID_TYPE
    }
  },
  audience: {
    isIn: {
      options: [tweetAudiences],
      errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
    }
  },
  parent_id: {
    custom: {
      options: (value, { req }) => {
        const type = (req.body as TweetRequestBody).type as TweetType
        // Nếu 'type' là retweet, comment, quotetweet thì 'parent_id' phải là 'tweet_id' của tweet cha
        if ([TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) && !ObjectId.isValid(value)) {
          throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID)
        }
        // nếu 'type' là tweet thì 'parent_id' phải là 'null'
        if (type === TweetType.Tweet && value !== null) {
          throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL)
        }
        return true
      }
    }
  },
  content: {
    isString: true,
    custom: {
      options: (value, { req }) => {
        const type = (req.body as TweetRequestBody).type as TweetType
        const mentions = (req.body as TweetRequestBody).mentions as string[]
        const hashtags = (req.body as TweetRequestBody).hashtags as string[]

        // Nếu 'type' là comment, quotetweet, tweet và không có 'mentions' và 'hashtags' thì 'content' phải là string và không được rỗng.
        if (
          [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(type) &&
          isEmpty(mentions) &&
          isEmpty(hashtags) &&
          value === ''
        ) {
          throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING)
        }
        // Nếu 'type' là retweet thì 'content' phải là ''''.
        if (type === TweetType.Retweet && value !== '') {
          throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_AN_EMPTY_STRING)
        }
        return true
      }
    }
  },
  hashtags: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        // Yêu cầu mỗi phần tử trong array phải là string
        if (value.some((item: any) => typeof item !== 'string')) {
          throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING)
        }
        return true
      }
    }
  },
  mentions: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        // Yêu cầu mỗi phần tử trong array phải là user_id
        if (value.some((item: any) => !ObjectId.isValid(value))) {
          throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID)
        }
        return true
      }
    }
  },
  medias: {
    isArray: true,
    custom: {
      options: (value, { req }) => {
        // Yêu cầu mỗi phần tử trong array phải là Media object
        if (
          value.some((item: any) => {
            return typeof item.url !== 'string' || !mediaType.includes(item.type)
          })
        ) {
          throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT)
        }
        return true
      }
    }
  }
})

export const tweetIdValidator = checkSchema(
  {
    tweet_id: {
      custom: {
        options: async (value, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new ErrorWithStatus({ message: TWEETS_MESSAGES.INVALID_TWEET_ID, status: HTTP_STATUS.BAD_REQUEST })
          }
          const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(value) })
          if (!tweet) {
            throw new ErrorWithStatus({ message: TWEETS_MESSAGES.TWEET_NOT_FOUND, status: HTTP_STATUS.NOT_FOUND })
          }
          req.tweet = tweet
          return true
        }
      }
    }
  },
  ['body', 'params']
)

export const audienceValidator = async (req: Request, res: Response, next: NextFunction) => {
  const tweet = req.tweet as Tweet
  if (tweet.audience === TweetAudience.TwitterCircle) {
    // Kiểm tra người xem Tweet này đã đăng nhập hay chưa
    if (!req.decoded_authorization) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    }
    // Kiểm tra xem tài khoản tác giả của tweet đó có bị khóa hay bị xóa chưa
    const author = await databaseService.users.findOne({ _id: tweet.user_id })
    if (!author || author.verify === UserVerifyStatus.Banned) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // Kiểm tra người xem Tweet này có nằm trong Twitter Circle của tác giả hay không
    const { user_id } = req.decoded_authorization
    const isInTwitterCircle = author.twitter_circle.some((user_circle_id) => user_circle_id.equals(user_id))
    // Nếu người xem không phải là tác giả VÀ không nằm trong twitter circle thì ném lỗi
    if (!author._id.equals(user_id) && !isInTwitterCircle) {
      throw new ErrorWithStatus({
        message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC,
        status: HTTP_STATUS.FORBIDDEN
      })
    }
  }
  next()
}
