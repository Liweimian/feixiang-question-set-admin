import { catalogBindings } from '../data/mockData'
import type { CatalogBinding, CatalogTreeType } from '../features/question-sets/types'

let bindings = catalogBindings.map((item) => ({ ...item }))

export function summarizeQuestionSetBindings(rows: CatalogBinding[], setId: string) {
  const activeRows = rows.filter((item) => item.setId === setId && item.status !== '失效')
  const linkedCategoryCounts: Partial<Record<CatalogTreeType, number>> = {}

  activeRows.forEach((item) => {
    linkedCategoryCounts[item.treeType] = (linkedCategoryCounts[item.treeType] ?? 0) + 1
  })

  const linkedCategories = (['同步练习树', '专题树'] as CatalogTreeType[])
    .filter((treeType) => Boolean(linkedCategoryCounts[treeType]))

  return {
    bindings: activeRows,
    linkedCategories,
    linkedCategoryCounts,
    bindingStatus: activeRows.length > 0 ? 'bound' as const : 'unbound' as const,
  }
}

export const catalogBindingRepository = {
  list() {
    return bindings.map((item) => ({ ...item }))
  },
  add(binding: CatalogBinding) {
    const duplicated = bindings.some((item) => item.setId === binding.setId
      && item.treeType === binding.treeType
      && item.nodeId === binding.nodeId
      && item.status !== '失效')
    if (duplicated) return false
    bindings = [...bindings, { ...binding }]
    return true
  },
  remove(id: string) {
    bindings = bindings.filter((item) => item.id !== id)
  },
  replaceForQuestionSet(setId: string, nextBindings: CatalogBinding[]) {
    bindings = [...bindings.filter((item) => item.setId !== setId), ...nextBindings.map((item) => ({ ...item }))]
  },
  getByQuestionSet(setId: string) {
    return bindings.filter((item) => item.setId === setId && item.status !== '失效').map((item) => ({ ...item }))
  },
}
