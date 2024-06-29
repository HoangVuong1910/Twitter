import { MediaTypeQuery } from '~/constants/enums'
import { Pagination } from './Tweet.requests'

export default interface SearchQuery extends Pagination {
  content: string
  media_type: MediaTypeQuery
}
