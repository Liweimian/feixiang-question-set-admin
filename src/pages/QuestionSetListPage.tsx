import type { Key, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  MetisButton,
  MetisEmpty,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTable,
  MetisTag,
} from '@yuanfudao/metis-web-component'
import { useNavigate } from 'react-router-dom'
import { GenerateQuestionSetDialog } from '../components/GenerateQuestionSetDialog'
import {
  BindingStatusTag,
  ContentStatusTag,
  MethodLabel,
  TypeTag,
} from '../components/StatusTags'
import type {
  BindingStatus,
  ContentStatus,
  ProductionMethod,
  QuestionSet,
  QuestionSetFilters,
  QuestionSetType,
} from '../features/question-sets/types'
import type { AsyncStatus, PageQuery, PageResult } from '../prototype/types'
import { questionSetRepository } from '../services/questionSetRepository'

const initialQuery: PageQuery<QuestionSetFilters> = { page: 1, pageSize: 10, keyword: '', filters: {} }
const emptyResult: PageResult<QuestionSet> = { items: [], total: 0, page: 1, pageSize: 10 }

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="filter-field"><span>{label}</span><div>{children}</div></label>
}

export function QuestionSetListPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initialQuery)
  const [result, setResult] = useState(emptyResult)
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [selectedKeys, setSelectedKeys] = useState<Key[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedFilters, setExpandedFilters] = useState(true)

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
    { title: '题单ID', dataIndex: 'id', key: 'id', width: 120, render: (value: string) => <button className="table-link" type="button" onClick={() => navigate(`/assets/${value}`)}>{value}</button> },
    { title: '题单名称', dataIndex: 'title', key: 'title', width: 250, render: (value: string, item: QuestionSet) => <button className="table-link table-link-title" type="button" onClick={() => navigate(`/assets/${item.id}`)}>{value}</button> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 110, render: (_: unknown, item: QuestionSet) => <TypeTag value={item.type} /> },
    { title: '阶段', key: 'phase', width: 90, render: (_: unknown, item: QuestionSet) => item.scope.phase || '-' },
    { title: '科目', key: 'subject', width: 90, render: (_: unknown, item: QuestionSet) => item.scope.subject || '-' },
    { title: '年级', key: 'grade', width: 100, render: (_: unknown, item: QuestionSet) => item.type === 'topic' ? '-' : item.scope.grade || '-' },
    { title: '学期', key: 'semester', width: 90, render: (_: unknown, item: QuestionSet) => item.scope.semester || (item.type === 'topic' ? '-' : item.scope.volume.replace('册', '学期')) },
    { title: '教材版本', key: 'textbook', width: 170, render: (_: unknown, item: QuestionSet) => item.type === 'topic' ? '-' : item.scope.textbook || '-' },
    { title: '生产方式', key: 'method', width: 120, render: (_: unknown, item: QuestionSet) => <MethodLabel value={item.method} /> },
    { title: '来源', key: 'source', width: 210, render: (_: unknown, item: QuestionSet) => item.source.workbookId ? <a className="table-link" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${item.source.workbookId}`} target="_blank" rel="noreferrer">{item.source.workbookName ?? `练习册 ${item.source.workbookId}`}</a> : <span>{item.source.chapterPath || '人工创建'}</span> },
    {
      title: '题量', key: 'content', width: 95,
      render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.questionCount} 题</strong><span>{item.duration} 分钟 · {item.difficulty}</span></div>,
    },
    { title: '目录关联', dataIndex: 'bindingStatus', key: 'bindingStatus', width: 105, render: (_: unknown, item: QuestionSet) => <BindingStatusTag value={item.bindingStatus} /> },
    { title: '状态', dataIndex: 'contentStatus', key: 'contentStatus', width: 95, render: (_: unknown, item: QuestionSet) => <ContentStatusTag value={item.contentStatus} /> },
    { title: '创建时间', dataIndex: 'updatedAt', key: 'createdAt', width: 160 },
    { title: '创建人', dataIndex: 'owner', key: 'creator', width: 100 },
    {
      title: '操作', key: 'actions', fixed: 'right' as const, width: 310,
      render: (_: unknown, item: QuestionSet) => <div className="table-actions"><MetisButton type="borderless" onClick={() => { const nextStatus = item.contentStatus === 'published' ? 'offline' : 'published'; setResult((current) => ({ ...current, items: current.items.map((row) => row.id === item.id ? { ...row, contentStatus: nextStatus } : row) })); MetisMessage.success(item.contentStatus === 'published' ? '题单已下线' : '题单已上线') }}>状态控制</MetisButton><MetisButton type="borderless" onClick={() => navigate(`/assets/${item.id}?tab=operations`)}>操作记录</MetisButton><MetisButton type="borderless" onClick={() => navigate(`/assets/${item.id}?tab=production`)}>生产记录</MetisButton><MetisButton type="borderless" onClick={() => { setResult((current) => ({ ...current, total: Math.max(0, current.total - 1), items: current.items.filter((row) => row.id !== item.id) })); MetisMessage.success(`已删除题单 ${item.id}`) }}>删除</MetisButton></div>,
    },
  ], [navigate])

  return (
    <div className="page-container question-set-list-page">
      <header className="page-heading" data-sec="1">
        <div>
          <span className="breadcrumb">内容库 / 题单库</span>
          <h1>题单库</h1>
          <p>统一管理同步练习与专题题单；生成记录与规则作为题单库的辅助能力。</p>
        </div>
        <div className="heading-actions">
          <MetisButton onClick={() => MetisMessage.info('打开纯人工组题流程')}>新建题单</MetisButton>
          <MetisButton type="primary" data-track="/click/questionSetList/generateFromWorkbook | 从练习册生成题单 | 无" onClick={() => setDialogOpen(true)}>从练习册生成</MetisButton>
        </div>
      </header>

      <section className="filter-card paper-like-filters" data-sec="2" aria-label="题单筛选">
        <div className="filter-card-heading"><strong>筛选题单</strong><MetisButton type="borderless" onClick={() => setExpandedFilters((value) => !value)}>{expandedFilters ? '收起筛选' : '展开筛选'}</MetisButton></div>
        <div className="filter-form-grid">
          <FilterField label="题单ID"><MetisInput value={query.filters.id} placeholder="多个ID可分行输入" onChange={(event) => updateFilters({ id: event.target.value })} /></FilterField>
          <FilterField label="名称"><MetisInput value={query.filters.title} placeholder="请输入题单名称" onChange={(event) => updateFilters({ title: event.target.value })} /></FilterField>
          <FilterField label="题目ID"><MetisInput value={query.filters.questionId} placeholder="请输入题目ID" onChange={(event) => updateFilters({ questionId: event.target.value })} /></FilterField>
          <FilterField label="类型"><MetisSelect allowClear value={query.filters.type} placeholder="全部类型" options={[{label:'同步练习',value:'sync'},{label:'专题',value:'topic'}]} onChange={(value) => updateFilters({ type: value as QuestionSetType | undefined })} /></FilterField>
          <FilterField label="阶段"><MetisSelect allowClear value={query.filters.phase} placeholder="全部阶段" options={[{label:'小学',value:'小学'},{label:'初中',value:'初中'},{label:'高中',value:'高中'}]} onChange={(value) => updateFilters({ phase: value ? String(value) : undefined })} /></FilterField>
          <FilterField label="科目"><MetisSelect allowClear value={query.filters.subject} placeholder="全部科目" options={[{label:'语文',value:'语文'},{label:'数学',value:'数学'},{label:'英语',value:'英语'},{label:'物理',value:'物理'}]} onChange={(value) => updateFilters({ subject: value ? String(value) : undefined })} /></FilterField>
          <FilterField label="年级"><MetisSelect allowClear value={query.filters.grade} placeholder="全部年级" options={[{label:'七年级',value:'七年级'},{label:'八年级',value:'八年级'},{label:'九年级',value:'九年级'}]} onChange={(value) => updateFilters({ grade: value ? String(value) : undefined })} /></FilterField>
          <FilterField label="学期"><MetisSelect allowClear value={query.filters.semester} placeholder="全部学期" options={[{label:'上学期',value:'上学期'},{label:'下学期',value:'下学期'}]} onChange={(value) => updateFilters({ semester: value ? String(value) : undefined })} /></FilterField>
          <FilterField label="教材版本"><MetisSelect allowClear value={query.filters.textbook} placeholder="全部教材版本" options={[{label:'沪教版(五四制)',value:'沪教版'},{label:'统编版',value:'统编版'},{label:'多版本/通用',value:'多版本'}]} onChange={(value) => updateFilters({ textbook: value ? String(value) : undefined })} /></FilterField>
          <FilterField label="生产方式"><MetisSelect allowClear value={query.filters.method} placeholder="全部生产方式" options={[{label:'练习册生成',value:'workbook'},{label:'人工组题',value:'manual'},{label:'规则生成',value:'rule'}]} onChange={(value) => updateFilters({ method: value as ProductionMethod | undefined })} /></FilterField>
          <FilterField label="来源练习册ID"><MetisInput value={query.filters.workbookId} placeholder="请输入练习册ID" onChange={(event) => updateFilters({ workbookId: event.target.value })} /></FilterField>
          {expandedFilters && <>
            <FilterField label="状态"><MetisSelect allowClear value={query.filters.contentStatus} placeholder="全部状态" options={[{label:'草稿',value:'draft'},{label:'已上线',value:'published'},{label:'已下线',value:'offline'}]} onChange={(value) => updateFilters({ contentStatus: value as ContentStatus | undefined })} /></FilterField>
            <FilterField label="目录关联"><MetisSelect allowClear value={query.filters.bindingStatus} placeholder="全部关联状态" options={[{label:'已关联',value:'bound'},{label:'未关联',value:'unbound'}]} onChange={(value) => updateFilters({ bindingStatus: value as BindingStatus | undefined })} /></FilterField>
          </>}
        </div>
        <div className="filter-actions"><MetisButton onClick={() => setQuery(initialQuery)}>重置</MetisButton><MetisButton type="primary" onClick={() => void load()}>搜索</MetisButton></div>
      </section>

      <section className="table-card" data-sec="3">
        <div className="table-toolbar">
          <div><strong>题单列表</strong><span>当前筛选共 {result.total} 条</span></div>
          <div className="toolbar-actions">
            {selectedKeys.length > 0 && <MetisTag color="processing">已选 {selectedKeys.length} 项</MetisTag>}
          </div>
        </div>
        {status === 'error' ? <div className="feedback-state"><MetisEmpty description="题单加载失败" /><MetisButton onClick={() => void load()}>重新加载</MetisButton></div> : (
          <MetisTable<QuestionSet>
            rowKey="id"
            loading={status === 'loading'}
            columns={columns}
            dataSource={result.items}
            scroll={{ x: 2100 }}
            rowSelection={{ selectedRowKeys: selectedKeys, onChange: (keys: Key[]) => setSelectedKeys(keys) }}
            pagination={{ current: query.page, pageSize: query.pageSize, total: result.total, onChange: (page: number, pageSize: number) => setQuery((current) => ({ ...current, page, pageSize })) }}
          />
        )}
      </section>

      <GenerateQuestionSetDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onGenerated={() => navigate('/jobs')} />
    </div>
  )
}
