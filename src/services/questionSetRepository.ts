import { questionSets } from '../data/mockData'
import type { QuestionSet, QuestionSetFilters } from '../features/question-sets/types'
import type { PageQuery, PageResult } from '../prototype/types'

const wait = (milliseconds: number) => new Promise((resolve) => window.setTimeout(resolve, milliseconds))

export interface QuestionSetRepository {
  list(query: PageQuery<QuestionSetFilters>): Promise<PageResult<QuestionSet>>
  get(id: string): Promise<QuestionSet | undefined>
}

export const questionSetRepository: QuestionSetRepository = {
  async list(query) {
    await wait(260)
    const keyword = query.keyword?.trim().toLowerCase() ?? ''
    const filtered = questionSets.filter((item) => {
      const keywordMatched = !keyword || [item.id, item.title, item.source.workbookId, ...item.source.chapterIds]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
      const filters = query.filters
      return keywordMatched
        && (!filters.type || item.type === filters.type)
        && (!filters.contentStatus || item.contentStatus === filters.contentStatus)
        && (!filters.syncStatus || item.syncStatus === filters.syncStatus)
        && (!filters.bindingStatus || item.bindingStatus === filters.bindingStatus)
        && (!filters.subject || item.scope.subject === filters.subject)
    })
    const start = (query.page - 1) * query.pageSize
    return {
      items: filtered.slice(start, start + query.pageSize),
      total: filtered.length,
      page: query.page,
      pageSize: query.pageSize,
    }
  },
  async get(id) {
    await wait(120)
    return questionSets.find((item) => item.id === id)
  },
}
