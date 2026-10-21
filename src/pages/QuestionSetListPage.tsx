import type { Key } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MetisButton,
  MetisEmpty,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTable,
  MetisTabs,
  MetisTag,
} from '@yuanfudao/metis-web-component'
import { useNavigate } from 'react-router-dom'
import { GenerateQuestionSetDialog } from '../components/GenerateQuestionSetDialog'
import {
  BindingStatusTag,
  ContentStatusTag,
  MethodLabel,
  SyncStatusTag,
  TypeTag,
} from '../components/StatusTags'
import type { ContentStatus, QuestionSet, QuestionSetFilters, QuestionSetType, SyncStatus } from '../features/question-sets/types'
import type { AsyncStatus, PageQuery, PageResult } from '../prototype/types'
import { questionSetRepository } from '../services/questionSetRepository'

const initialQuery: PageQuery<QuestionSetFilters> = {
  page: 1,
  pageSize: 10,
  keyword: '',
  filters: {},
}

const emptyResult: PageResult<QuestionSet> = { items: [], total: 0, page: 1, pageSize: 10 }

export function QuestionSetListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState(emptyResult)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const load = useCallback(async () => {
    setStatus('loading')
    try {
      setResult(await questionSetRepository.list(query))
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }, [query])

  useEffect(() => { void load() }, [load])

  const updateFilters = (patch: Partial<QuestionSetFilters>) => {
    setQuery((current) => ({ ...current, page: 1, filters: { ...current.filters, ...patch } }))
  }

  const columns = useMemo(() => [
    {
      title: '题单', dataIndex: 'title', key: 'title', width: 290,
      render: (_: unknown, item: QuestionSet) => (
        <div className="title-cell">
          <div><TypeTag value={item.type} /><button type="button" onClick={() => navigate(`/assets/${item.id}`)}>{item.title}</button></div>
          <span>{item.id} · {item.tags.join(' / ')}</span>
        </div>
      ),
    },
    {
      title: '教学范围', key: 'scope', width: 220,
      render: (_: unknown, item: QuestionSet) => (
        <div className="stacked-cell"><strong>{item.scope.phase} · {item.scope.subject} · {item.scope.grade}</strong><span>{item.scope.textbook} · {item.scope.volume}</span></div>
      ),
    },
    {
      title: '来源', key: 'source', width: 290,
      render: (_: unknown, item: QuestionSet) => (
        <div className="stacked-cell">
          <strong><MethodLabel value={item.method} />{item.source.workbookId ? ` · 练习册 ${item.source.workbookId}` : ''}</strong>
          <span title={item.source.chapterPath}>{item.source.chapterPath}</span>
        </div>
      ),
    },
    {
      title: '内容', key: 'content', width: 116,
      render: (_: unknown, item: QuestionSet) => (
        <div className="stacked-cell"><strong>{item.questionCount} 题 · {item.duration} 分钟</strong><span>{item.difficulty}</span></div>
      ),
    },
    {
      title: '上游同步', dataIndex: 'syncStatus', key: 'syncStatus', width: 145,
      render: (_: unknown, item: QuestionSet) => (
        <div className="status-cell"><SyncStatusTag value={item.syncStatus} />{item.diff && <small>+{item.diff.added} / −{item.diff.removed} / 改{item.diff.updated}</small>}</div>
      ),
    },
    { title: '目录', dataIndex: 'bindingStatus', key: 'bindingStatus', width: 110, render: (_: unknown, item: QuestionSet) => <BindingStatusTag value={item.bindingStatus} /> },
    { title: '内容状态', dataIndex: 'contentStatus', key: 'contentStatus', width: 110, render: (_: unknown, item: QuestionSet) => <ContentStatusTag value={item.contentStatus} /> },
    {
      title: '最近更新', key: 'updatedAt', width: 150,
      render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.owner}</strong><span>{item.updatedAt}</span></div>,
    },
    {
      title: '操作', key: 'actions', fixed: 'right' as const, width: 150,
      render: (_: unknown, item: QuestionSet) => (
        <div className="table-actions">
          <MetisButton type="borderless" onClick={() => navigate(`/assets/${item.id}`)}>编辑</MetisButton>
          <MetisButton type="borderless" onClick={() => MetisMessage.info(`预览 ${item.title}`)}>预览</MetisButton>
        </div>
      ),
    },
  ], [navigate])

  const typeTabs = [
    { key: 'all', label: '全部题单' },
    { key: 'sync', label: '同步练习' },
    { key: 'topic', label: '专题' },
    { key: 'custom', label: '其他来源' },
  ]

  return (
    <div className="page-container question-set-list-page">
      <header className="page-heading" data-sec="1">
        <div>
          <span className="breadcrumb">内容生产 / 题单管理</span>
          <h1>题单库</h1>
          <p>统一管理同步练习、专题及其他来源题单；练习册只作为其中一种上游来源。</p>
        </div>
        <div className="heading-actions">
          <MetisButton onClick={() => MetisMessage.info('打开纯人工组题流程')}>新建空白题单</MetisButton>
          <MetisButton
            type="primary"
            data-track="/click/questionSetList/generateFromWorkbook | 从练习册生成题单 | 无"
            onClick={() => setDialogOpen(true)}
          >
            从练习册生成
          </MetisButton>
        </div>
      </header>

      <section className="metric-grid" data-sec="2" aria-label="题单状态概览">
        <button type="button" onClick={() => updateFilters({ contentStatus: undefined, syncStatus: undefined, bindingStatus: undefined })}>
          <span>题单总量</span><strong>1,286</strong><small>本周新增 96</small>
        </button>
        <button type="button" onClick={() => updateFilters({ contentStatus: 'review' })}>
          <span>待审核</span><strong>47</strong><small>其中 12 份今日到期</small>
        </button>
        <button type="button" onClick={() => updateFilters({ bindingStatus: 'pending' })}>
          <span>待目录关联</span><strong>23</strong><small>同步练习 18 · 专题 5</small>
        </button>
        <button type="button" className="metric-warning" onClick={() => updateFilters({ syncStatus: 'changed' })}>
          <span>上游待处理</span><strong>12</strong><small>含 3 个同步冲突</small>
        </button>
      </section>

      <section className="filter-card" data-sec="3" aria-label="题单筛选">
        <MetisTabs
          activeKey={query.filters.type ?? 'all'}
          items={typeTabs}
          onChange={(key) => updateFilters({ type: key === 'all' ? undefined : key as QuestionSetType })}
        />
        <div className="filter-grid">
          <MetisInput
            value={query.keyword}
            placeholder="题单名称 / 题单ID / 练习册ID / 章节ID"
            onChange={(event) => setQuery((current) => ({ ...current, page: 1, keyword: event.target.value }))}
          />
          <MetisSelect
            allowClear
            value={query.filters.contentStatus}
            placeholder="全部内容状态"
            options={[
              { label: '草稿', value: 'draft' }, { label: '待审核', value: 'review' },
              { label: '待发布', value: 'ready' }, { label: '已上线', value: 'published' }, { label: '已下线', value: 'offline' },
            ]}
            onChange={(value) => updateFilters({ contentStatus: value as ContentStatus | undefined })}
          />
          <MetisSelect
            allowClear
            value={query.filters.syncStatus}
            placeholder="全部上游状态"
            options={[
              { label: '已同步', value: 'synced' }, { label: '上游有变更', value: 'changed' },
              { label: '同步冲突', value: 'conflict' }, { label: '人工锁定', value: 'locked' }, { label: '来源失效', value: 'invalid' },
            ]}
            onChange={(value) => updateFilters({ syncStatus: value as SyncStatus | undefined })}
          />
          <MetisSelect
            allowClear
            value={query.filters.subject}
            placeholder="全部学科"
            options={[{ label: '数学', value: '数学' }, { label: '物理', value: '物理' }, { label: '语文', value: '语文' }]}
            onChange={(value) => updateFilters({ subject: value ? String(value) : undefined })}
          />
          <MetisButton onClick={() => setQuery(initialQuery)}>重置</MetisButton>
        </div>
      </section>

      <section className="table-card" data-sec="4">
        <div className="table-toolbar">
          <div><strong>题单列表</strong><span>当前筛选共 {result.total} 条</span></div>
          <div className="toolbar-actions">
            {selectedKeys.length > 0 && <MetisTag color="processing">已选 {selectedKeys.length} 项</MetisTag>}
            <MetisButton disabled={!selectedKeys.length} onClick={() => MetisMessage.success('已批量提交审核')}>批量提交审核</MetisButton>
            <MetisButton disabled={!selectedKeys.length} onClick={() => MetisMessage.info('打开批量关联目录')}>批量关联目录</MetisButton>
          </div>
        </div>
        {status === 'error' ? (
          <div className="feedback-state"><MetisEmpty description="题单加载失败" /><MetisButton onClick={() => void load()}>重新加载</MetisButton></div>
        ) : (
          <MetisTable<QuestionSet>
            rowKey="id"
            loading={status === 'loading'}
            columns={columns}
            dataSource={result.items}
            scroll={{ x: 1450 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys: Key[]) => setSelectedKeys(keys) }}
            pagination={{
              current: query.page,
              pageSize: query.pageSize,
              total: result.total,
              onChange: (page: number, pageSize: number) => setQuery((current) => ({ ...current, page, pageSize })),
            }}
          />
        )}
      </section>

      <GenerateQuestionSetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onGenerated={() => navigate('/jobs')}
      />
    </div>
  )
}
