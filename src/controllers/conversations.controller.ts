import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { CONVERSATIONS_MESSAGES } from '~/constants/messages'

import { TokenPayload } from '~/models/requests/User.requests'
import conversationsService from '~/services/conversations.services'

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  const { receiver_id } = req.params
  const sender_id = req.decoded_authorization?.user_id as string
  const limit = Number(req.query.limit)
  const page = Number(req.query.page)
  const result = await conversationsService.getConversations({
    sender_id,
    receiver_id,
    limit,
    page
  })
  return res.json({
    message: CONVERSATIONS_MESSAGES.GET_CONVERSATION_SUCCESSFULLY,
    result: {
      limit,
      page,
      total_page: Math.ceil(result.total / limit),
      conversations: result.conversations
    }
  })
}
