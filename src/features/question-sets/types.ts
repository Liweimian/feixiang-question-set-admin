export type EntityId = string

export type QuestionSetType = 'sync' | 'topic' | 'custom'
export type ProductionMethod = 'workbook' | 'manual' | 'rule'
export type ContentStatus = 'draft' | 'review' | 'ready' | 'published' | 'offline'
export type SyncStatus = 'synced' | 'changed' | 'conflict' | 'locked' | 'invalid' | 'none'
export type BindingStatus = 'bound' | 'pending' | 'partial' | 'invalid'
export type SyncPolicy = 'merge' | 'follow' | 'lock'

export interface TeachingScope {
  phase: string
  subject: string
  grade: string
  textbook: string
  volume: string
}

export interface SourceSummary {
  workbookId?: string
  workbookName?: string
  chapterIds: string[]
  chapterPath: string
  sourceVersion?: string
  ruleVersion?: string
}

export interface SourceDiff {
  added: number
  removed: number
  updated: number
  reordered: number
}

export interface QuestionSet {
  id: EntityId
  title: string
  description: string
  type: QuestionSetType
  method: ProductionMethod
  scope: TeachingScope
  source: SourceSummary
  questionCount: number
  duration: number
  difficulty: string
  tags: string[]
  contentStatus: ContentStatus
  syncStatus: SyncStatus
  bindingStatus: BindingStatus
  syncPolicy: SyncPolicy
  onlineVersion?: string
  draftVersion?: string
  owner: string
  updatedAt: string
  diff?: SourceDiff
}

export interface QuestionItem {
  id: EntityId
  revision: string
  order: number
  group: string
  stem: string
  type: string
  difficulty: string
  sourceModule: string
  origin: 'source' | 'manual'
  quality: 'passed' | 'warning' | 'blocked'
}

export interface VersionRecord {
  version: string
  status: string
  sourceSnapshot: string
  summary: string
  questionCount: number
  creator: string
  createdAt: string
  publishedAt?: string
}

export interface GenerationJob {
  id: EntityId
  trigger: '自动事件' | '人工批量' | '失败重试'
  workbook: string
  workbookId: string
  ruleVersion: string
  eligible: number
  created: number
  updated: number
  skipped: number
  conflict: number
  failed: number
  status: 'running' | 'success' | 'partial' | 'failed'
  startedAt: string
  duration: string
  initiator: string
}

export interface CatalogBinding {
  id: EntityId
  treeType: '同步练习树' | '专题树'
  nodePath: string
  nodeId: string
  setTitle: string
  setId: string
  primary: boolean
  region: string
  status: '有效' | '待生效' | '失效'
  operator: string
  updatedAt: string
}

export interface QuestionSetFilters {
  type?: QuestionSetType
  contentStatus?: ContentStatus
  syncStatus?: SyncStatus
  bindingStatus?: BindingStatus
  subject?: string
}
