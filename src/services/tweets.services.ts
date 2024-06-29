import { TweetRequestBody } from '~/models/requests/Tweet.requests'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId, WithId } from 'mongodb'
import Hashtag from '~/models/schemas/Hashtag.schema'
import { TweetType } from '~/constants/enums'

class TweetsService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          { $setOnInsert: new Hashtag({ name: hashtag }) },
          { upsert: true, returnDocument: 'after' }
        )
      })
    )
    return hashtagDocuments.map((hashtagDocument) => (hashtagDocument as WithId<Hashtag>)._id)
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags)
    console.log(hashtags)
    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id)
      })
    )
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return tweet
  }

  // async getTweet(tweet_id: string) {
  //   const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) })
  //   return tweet
  // }

  async increaseTweet(tweet_id: string, user_id?: string) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 }
    const result = await databaseService.tweets.findOneAndUpdate(
      { _id: new ObjectId(tweet_id) },
      { $inc: inc, $currentDate: { updated_at: true } },
      {
        returnDocument: 'after',
        projection: {
          guest_views: 1,
          user_views: 1
        }
      }
    )
    return result
  }

  async getNewFeeds({ user_id, limit, page }: { user_id: string; limit: number; page: number }) {
    const user_id_obj = new ObjectId(user_id)
    // lấy ra toàn bộ follower của user đó
    const followed_user_ids = await databaseService.followers
      .find(
        { user_id: user_id_obj },
        {
          projection: {
            followed_user_id: 1,
            _id: 0
          }
        }
      )
      .toArray()
    const ids = followed_user_ids.map((item) => item.followed_user_id)
    // đẩy luôn user id vào danh sách, bởi vì các newfeeds sẽ hiện các tweet của các follower của user đó và các tweet của chính user đó luôn
    ids.push(user_id_obj)

    const [tweets, total] = await Promise.all([
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                // $in: [new ObjectId('667d83c9ecb3a1e090e91364')]
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_obj]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $skip: limit * (page - 1)
          },
          {
            $limit: limit
          },
          {
            $lookup: {
              from: 'hashtags',
              localField: 'hashtags',
              foreignField: '_id',
              as: 'hashtags'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'mentions',
              foreignField: '_id',
              as: 'mentions'
            }
          },
          {
            $addFields: {
              mentions: {
                $map: {
                  input: '$mentions',
                  as: 'mention',
                  in: {
                    _id: '$$mention._id',
                    name: '$$mention.name',
                    username: '$$mention.username',
                    email: '$$mention.email'
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'bookmarks',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'bookmarks'
            }
          },
          {
            $lookup: {
              from: 'likes',
              localField: '_id',
              foreignField: 'tweet_id',
              as: 'likes'
            }
          },
          {
            $lookup: {
              from: 'tweets',
              localField: '_id',
              foreignField: 'parent_id',
              as: 'tweet_children'
            }
          },
          {
            $addFields: {
              bookmarks: {
                $size: '$bookmarks'
              },
              likes: {
                $size: '$likes'
              },
              retweet_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Retweet]
                    }
                  }
                }
              },
              comment_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.Comment]
                    }
                  }
                }
              },
              quote_count: {
                $size: {
                  $filter: {
                    input: '$tweet_children',
                    as: 'item',
                    cond: {
                      $eq: ['$$item.type', TweetType.QuoteTweet]
                    }
                  }
                }
              }
            }
          },
          {
            $project: {
              tweet_children: 0,
              user: {
                password: 0,
                date_of_birth: 0,
                email_verify_token: 0,
                forgot_password_token: 0,
                twitter_circle: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate([
          {
            $match: {
              user_id: {
                $in: ids
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 0
                },
                {
                  $and: [
                    {
                      audience: 1
                    },
                    {
                      'user.twitter_circle': {
                        $in: [user_id_obj]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    const tweet_ids = tweets.map((tweet) => tweet._id as ObjectId)
    const date = new Date()
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweet_ids
        }
      },
      {
        $inc: { user_views: 1 },
        $set: {
          updated_at: date
        }
      }
    )

    tweets.forEach((tweet) => {
      tweet.updated_at = date
      tweet.user_views += 1
    })
    console.log('check total', total)
    return {
      tweets,
      total: total[0]?.total || 0
    }
  }
}

const tweetsService = new TweetsService()
export default tweetsService

// tweets
// aggregate([
//   {
//     $match: {
//       user_id: {
//         // $in: [new ObjectId('667d83c9ecb3a1e090e91364')]
//         $in: ids
//       }
//     }
//   },
//   {
//     $lookup: {
//       from: 'users',
//       localField: 'user_id',
//       foreignField: '_id',
//       as: 'user'
//     }
//   },
//   {
//     $unwind: {
//       path: '$user'
//     }
//   },
//   {
//     $match: {
//       $or: [
//         {
//           audience: 0
//         },
//         {
//           $and: [
//             {
//               audience: 1
//             },
//             {
//               'user.twitter_circle': {
//                 $in: [user_id_obj]
//               }
//             }
//           ]
//         }
//       ]
//     }
//   },
//   {
//     $skip: limit * (page -1)
//   },
//   {
//     $limit: limit
//   }
//   {
//     $lookup: {
//       from: 'hashtags',
//       localField: 'hashtags',
//       foreignField: '_id',
//       as: 'hashtags'
//     }
//   },
//   {
//     $lookup: {
//       from: 'users',
//       localField: 'mentions',
//       foreignField: '_id',
//       as: 'mentions'
//     }
//   },
//   {
//     $addFields: {
//       mentions: {
//         $map: {
//           input: '$mentions',
//           as: 'mention',
//           in: {
//             _id: '$$mention._id',
//             name: '$$mention.name',
//             username: '$$mention.username',
//             email: '$$mention.email'
//           }
//         }
//       }
//     }
//   },
//   {
//     $lookup: {
//       from: 'bookmarks',
//       localField: '_id',
//       foreignField: 'tweet_id',
//       as: 'bookmarks'
//     }
//   },
//   {
//     $lookup: {
//       from: 'likes',
//       localField: '_id',
//       foreignField: 'tweet_id',
//       as: 'likes'
//     }
//   },
//   {
//     $lookup: {
//       from: 'tweets',
//       localField: '_id',
//       foreignField: 'parent_id',
//       as: 'tweet_children'
//     }
//   },
//   {
//     $addFields: {
//       bookmarks: {
//         $size: '$bookmarks'
//       },
//       likes: {
//         $size: '$likes'
//       },
//       retweet_count: {
//         $size: {
//           $filter: {
//             input: '$tweet_children',
//             as: 'item',
//             cond: {
//               $eq: ['$$item.type', TweetType.Retweet]
//             }
//           }
//         }
//       },
//       comment_count: {
//         $size: {
//           $filter: {
//             input: '$tweet_children',
//             as: 'item',
//             cond: {
//               $eq: ['$$item.type', TweetType.Comment]
//             }
//           }
//         }
//       },
//       quote_count: {
//         $size: {
//           $filter: {
//             input: '$tweet_children',
//             as: 'item',
//             cond: {
//               $eq: ['$$item.type', TweetType.QuoteTweet]
//             }
//           }
//         }
//       }
//     }
//   },
//   {
//     $project: {
//       tweet_children: 0,
//       user: {
//         password: 0,
//         date_of_birth: 0,
//         email_verify_token: 0,
//         forgot_password_token: 0,
//         twitter_circle: 0
//       }
//     }
//   },
// ])
// .toArray()
