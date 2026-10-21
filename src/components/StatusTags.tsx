import { MetisTag } from '@yuanfudao/metis-web-component'
import type {
  BindingStatus,
  ContentStatus,
  ProductionMethod,
  QuestionSetType,
  SyncStatus,
} from '../features/question-sets/types'

const contentMeta: Record<ContentStatus, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  review: { label: '待审核', color: 'processing' },
  ready: { label: '待发布', color: 'warning' },
  published: { label: '已上线', color: 'success' },
  offline: { label: '已下线', color: 'default' },
}

const syncMeta: Record<SyncStatus, { label: string; color: string }> = {
  synced: { label: '已同步', color: 'success' },
  changed: { label: '上游有变更', color: 'warning' },
  conflict: { label: '同步冲突', color: 'error' },
  locked: { label: '人工锁定', color: 'default' },
  invalid: { label: '来源失效', color: 'error' },
  none: { label: '无上游', color: 'default' },
}

const bindingMeta: Record<BindingStatus, { label: string; color: string }> = {
  bound: { label: '已关联', color: 'success' },
  pending: { label: '待关联', color: 'warning' },
  partial: { label: '部分关联', color: 'processing' },
  invalid: { label: '关联失效', color: 'error' },
}

const typeMeta: Record<QuestionSetType, string> = {
  sync: '同步练习',
  topic: '专题',
  custom: '其他题单',
}

const methodMeta: Record<ProductionMethod, string> = {
  workbook: '练习册自动',
  manual: '人工创建',
  rule: '规则生成',
}

export function ContentStatusTag({ value }: { value: ContentStatus }) {
  const item = contentMeta[value]
  return <MetisTag color={item.color}>{item.label}</MetisTag>
}

export function SyncStatusTag({ value }: { value: SyncStatus }) {
  const item = syncMeta[value]
  return <MetisTag color={item.color}>{item.label}</MetisTag>
}

export function BindingStatusTag({ value }: { value: BindingStatus }) {
  const item = bindingMeta[value]
  return <MetisTag color={item.color}>{item.label}</MetisTag>
}

export function TypeTag({ value }: { value: QuestionSetType }) {
  return <MetisTag color={value === 'sync' ? 'processing' : value === 'topic' ? 'purple' : 'default'}>{typeMeta[value]}</MetisTag>
}

export function MethodLabel({ value }: { value: ProductionMethod }) {
  return <span>{methodMeta[value]}</span>
}
