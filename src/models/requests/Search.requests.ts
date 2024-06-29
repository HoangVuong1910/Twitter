import { Pagination } from './Tweet.requests'

export default interface SearchQuery extends Pagination {
  content: string
}
