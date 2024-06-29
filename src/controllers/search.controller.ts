import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { SEARCH_MESSAGES } from '~/constants/messages'
import SearchQuery from '~/models/requests/Search.requests'
import searchService from '~/services/search.services'

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const user_id = req.decoded_authorization?.user_id as string
  const { content, media_type, people_follow } = req.query
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await searchService.search({ limit, page, content, media_type, user_id, people_follow })
  return res.json({
    message: SEARCH_MESSAGES.SEARCH_SUCCESSFULLY,
    result: {
      tweets: result.tweets,
      limit,
      page,
      total_page: Math.ceil(result.total / limit)
    }
  })
}
