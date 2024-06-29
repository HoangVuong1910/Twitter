import { checkSchema } from 'express-validator'
import { MediaTypeQuery, PeopleFollow } from '~/constants/enums'
import { SEARCH_MESSAGES } from '~/constants/messages'

export const searchValidator = checkSchema(
  {
    content: {
      isString: true,
      errorMessage: SEARCH_MESSAGES.CONTENT_MUST_BE_A_STRING
    },
    media_type: {
      optional: true,
      isIn: {
        options: [Object.values(MediaTypeQuery)]
      },
      errorMessage: SEARCH_MESSAGES.MEDIA_TYPE_MUST_BE_A_IMAGE_OR_VIDEO
    },
    people_follow: {
      optional: true,
      isIn: {
        options: [Object.values(PeopleFollow)]
      },
      errorMessage: SEARCH_MESSAGES.PEOPLE_FOLLOW_MUST_BE_AN_0_OR_1
    }
  },
  ['query']
)
