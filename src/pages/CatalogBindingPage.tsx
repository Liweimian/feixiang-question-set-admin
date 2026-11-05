import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  MetisAlert,
  MetisButton,
  MetisDialog,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTable,
  MetisTabs,
  MetisTag,
} from '@yuanfudao/metis-web-component'
import { questionSets } from '../data/mockData'
import { LinkedCategoryTags } from '../components/StatusTags'
import type {
  BindingStatus,
  CatalogBinding,
  CatalogTreeType,
  ContentStatus,
  QuestionSet,
  QuestionSetFilters,
} from '../features/question-sets/types'
import { catalogBindingRepository, summarizeQuestionSetBindings } from '../services/catalogBindingRepository'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface CatalogBindingPageProps {
  mode: 'textbook' | 'topic'
}

type RelationTab = 'knowledge' | 'paper' | 'questionSet' | 'question'

type QuestionSetPickerFilters = Pick<QuestionSetFilters,
  | 'id'
  | 'title'
  | 'questionId'
  | 'linkedTreeType'
  | 'grade'
  | 'academicYear'
  | 'semester'
  | 'textbook'
  | 'workbookId'
  | 'contentStatus'
  | 'bindingStatus'
>

const initialQuestionSetPickerFilters: QuestionSetPickerFilters = {}

function PickerFilterField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="filter-field"><span>{label}</span><div>{children}</div></label>
}

interface DirectoryNode {
  id: string
  label: string
  level: number
  status?: '上线' | '下线'
  relationCount: number
}

interface RelatedResource {
  id: string
  name: string
  type: string
  status: string
  source: string
  updatedAt: string
}

const textbookNodes: DirectoryNode[] = [
  { id: 'book-hj8', label: '沪教版(五四制)(2024) 八年级上册', level: 0, status: '上线', relationCount: 18 },
  { id: 'chapter-19', label: '第19章 实数', level: 1, relationCount: 11 },
  { id: 'TC-310418', label: '19.1 算术平方根', level: 2, relationCount: 6 },
  { id: 'TC-310419', label: '19.2 平方根与立方根', level: 2, relationCount: 4 },
  { id: 'chapter-20', label: '第20章 二次根式', level: 1, relationCount: 8 },
  { id: 'TC-320473', label: '20.2 分母有理化', level: 2, relationCount: 3 },
  { id: 'book-hj9', label: '沪教版(五四制)(2024) 九年级上册', level: 0, status: '上线', relationCount: 14 },
]

const topicNodes: DirectoryNode[] = [
  { id: 'topic-root-1', label: '知识模块', level: 0, status: '上线', relationCount: 56 },
  { id: 'TOPIC-2201', label: '数与式 / 二次根式', level: 1, relationCount: 8 },
  { id: 'TOPIC-2402', label: '方程 / 一元二次方程', level: 1, relationCount: 12 },
  { id: 'topic-root-2', label: '难点突破', level: 0, status: '上线', relationCount: 18 },
  { id: 'TOPIC-5508', label: '分母有理化', level: 1, relationCount: 3 },
  { id: 'topic-root-3', label: '易错专项', level: 0, status: '下线', relationCount: 9 },
]

const resourcesByTab: Record<Exclude<RelationTab, 'questionSet'>, RelatedResource[]> = {
  knowledge: [
    { id: 'KP-100281', name: '算术平方根的概念', type: '知识点', status: '有效', source: '知识点库', updatedAt: '2026-10-20 14:08' },
    { id: 'KP-100286', name: '平方根的性质', type: '知识点', status: '有效', source: '知识点库', updatedAt: '2026-10-19 11:22' },
  ],
  paper: [
    { id: 'P-102938', name: '第19章 实数单元测试', type: '单元测试', status: '上线', source: '试卷库', updatedAt: '2026-10-18 16:30' },
    { id: 'P-102941', name: '八上数学期中综合练习', type: '期中', status: '上线', source: '试卷库', updatedAt: '2026-10-16 09:42' },
  ],
  question: [
    { id: '89283656', name: '算术平方根概念辨析', type: '单选题', status: '上线', source: '练习册 8554', updatedAt: '2026-10-21 10:12' },
    { id: '89260933', name: '平方根与算术平方根填空', type: '填空题', status: '上线', source: '练习册 8554', updatedAt: '2026-10-20 18:06' },
    { id: '89298141', name: '数轴上的算术平方根', type: '解答题', status: '上线', source: '练习册 8554', updatedAt: '2026-10-19 15:30' },
  ],
}

export function CatalogBindingPage({ mode }: CatalogBindingPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isTextbook = mode === 'textbook'
  const nodes = isTextbook ? textbookNodes : topicNodes
  const requestedNode = searchParams.get('node')
  const [selectedNode, setSelectedNode] = useState(isTextbook ? 'TC-310418' : 'TOPIC-2201')
  const [relationTab, setRelationTab] = useState<RelationTab>(isTextbook ? 'knowledge' : 'questionSet')
  const [topicPanel, setTopicPanel] = useState<'sets' | 'history'>('sets')
  const [questionSetDialogOpen, setQuestionSetDialogOpen] = useState(false)
  const [pickerFiltersExpanded, setPickerFiltersExpanded] = useState(true)
  const [pickerDraftFilters, setPickerDraftFilters] = useState<QuestionSetPickerFilters>(initialQuestionSetPickerFilters)
  const [pickerAppliedFilters, setPickerAppliedFilters] = useState<QuestionSetPickerFilters>(initialQuestionSetPickerFilters)
  const [boundRows, setBoundRows] = useState(() => catalogBindingRepository.list())

  useEffect(() => {
    setSelectedNode(requestedNode && nodes.some((node) => node.id === requestedNode)
      ? requestedNode
      : isTextbook ? 'TC-310418' : 'TOPIC-2201')
    setRelationTab(isTextbook ? 'knowledge' : 'questionSet')
    setTopicPanel('sets')
    setQuestionSetDialogOpen(false)
    setPickerFiltersExpanded(true)
    setPickerDraftFilters(initialQuestionSetPickerFilters)
    setPickerAppliedFilters(initialQuestionSetPickerFilters)
    setBoundRows(catalogBindingRepository.list())
  }, [isTextbook, nodes, requestedNode])

  const currentNode = nodes.find((node) => node.id === selectedNode) ?? nodes[0]
  const expectedTreeType = isTextbook ? '同步练习树' : '专题树'
  const bindings = boundRows.filter((binding) => binding.treeType === expectedTreeType && binding.nodeId === selectedNode)
  const selectableSets = useMemo(() => questionSets.filter((item) => {
    const summary = summarizeQuestionSetBindings(boundRows, item.id)
    const ids = pickerAppliedFilters.id?.split(/\s+/).map((value) => value.trim().toLowerCase()).filter(Boolean) ?? []
    const semester = item.scope.semester ?? (item.scope.volume ? item.scope.volume.replace('册', '学期') : undefined)
    return (!ids.length || ids.some((id) => item.id.toLowerCase().includes(id)))
      && (!pickerAppliedFilters.title || item.title.toLowerCase().includes(pickerAppliedFilters.title.trim().toLowerCase()))
      && (!pickerAppliedFilters.questionId || item.questionIds?.some((id) => id.includes(pickerAppliedFilters.questionId?.trim() ?? '')))
      && (!pickerAppliedFilters.linkedTreeType || summary.linkedCategories.includes(pickerAppliedFilters.linkedTreeType))
      && (!pickerAppliedFilters.grade || item.scope.grade === pickerAppliedFilters.grade)
      && (!pickerAppliedFilters.academicYear || item.scope.academicYear === pickerAppliedFilters.academicYear)
      && (!pickerAppliedFilters.semester || semester === pickerAppliedFilters.semester)
      && (!pickerAppliedFilters.textbook || item.scope.textbook?.includes(pickerAppliedFilters.textbook))
      && (!pickerAppliedFilters.workbookId || item.source.workbookId?.includes(pickerAppliedFilters.workbookId.trim()))
      && (!pickerAppliedFilters.contentStatus || item.contentStatus === pickerAppliedFilters.contentStatus)
      && (!pickerAppliedFilters.bindingStatus || summary.bindingStatus === pickerAppliedFilters.bindingStatus)
  }), [boundRows, pickerAppliedFilters])
  const updatePickerDraftFilters = (patch: Partial<QuestionSetPickerFilters>) => {
    setPickerDraftFilters((current) => ({ ...current, ...patch }))
  }
  const removeBinding = (id: string) => {
    catalogBindingRepository.remove(id)
    setBoundRows(catalogBindingRepository.list())
  }

  const resourceColumns = [
    { title: '资源ID', dataIndex: 'id', key: 'id', width: 130 },
    { title: '名称', dataIndex: 'name', key: 'name', width: 320, render: (value: string) => <strong>{value}</strong> },
    { title: '类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 160 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <MetisTag color={value === '有效' || value === '上线' ? 'success' : 'default'}>{value}</MetisTag> },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 160 },
    { title: '操作', key: 'actions', width: 130, render: (_: unknown, item: RelatedResource) => <div className="table-actions"><MetisButton type="borderless" onClick={() => MetisMessage.info(`查看 ${item.id}`)}>查看</MetisButton><MetisButton type="borderless" onClick={() => MetisMessage.info(`准备解除 ${item.id} 的关联`)}>解除</MetisButton></div> },
  ]

  const textbookQuestionSetColumns = [
    { title: '题单ID', dataIndex: 'setId', key: 'setId', width: 180, render: (value: string) => <button className="table-link" type="button" onClick={() => navigate(`/assets/${value}`)}>{value}</button> },
    { title: '题单名称', dataIndex: 'setTitle', key: 'setTitle', render: (value: string, item: CatalogBinding) => <button className="table-link table-link-title" type="button" onClick={() => navigate(`/assets/${item.setId}`)}>{value}</button> },
    { title: '已关联分类', key: 'linkedCategories', width: 240, render: (_: unknown, item: CatalogBinding) => { const summary = summarizeQuestionSetBindings(boundRows, item.setId); return <LinkedCategoryTags categories={summary.linkedCategories} counts={summary.linkedCategoryCounts} /> } },
    { title: '题单状态', dataIndex: 'status', key: 'status', width: 140, render: (value: string) => <MetisTag color={value === '有效' ? 'success' : 'warning'}>{value === '有效' ? '已上线' : value}</MetisTag> },
    { title: '操作', key: 'actions', width: 180, render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => navigate(`/assets/${item.setId}`)}>查看</MetisButton><MetisButton type="borderless" onClick={() => removeBinding(item.id)}>解除关联</MetisButton></div> },
  ]

  const textbookRelationItems = [
    { key: 'knowledge', label: `关联知识点（${resourcesByTab.knowledge.length}）` },
    { key: 'paper', label: `关联试卷（${resourcesByTab.paper.length}）` },
    { key: 'questionSet', label: `关联题单（${bindings.length}）` },
    { key: 'question', label: `关联题目（${resourcesByTab.question.length}）` },
  ]

  const relationLabel = { knowledge: '知识点', paper: '试卷', questionSet: '题单', question: '题目' }[relationTab]

  const topicHistory = [
    { id: 'LOG-1038', action: '关联题单', detail: '关联「二次根式易错专项训练」', operator: '王晓慧', updatedAt: '2026-10-25 16:42' },
    { id: 'LOG-1026', action: '编辑节点', detail: '节点名称由「根式易错」修改为「二次根式易错」', operator: '李嘉', updatedAt: '2026-10-24 11:18' },
    { id: 'LOG-1009', action: '上线节点', detail: '专题节点上线，可用于前台投放', operator: '王晓慧', updatedAt: '2026-10-22 09:30' },
  ]

  const libraryColumns = [
    { title: '题单ID / 名称', key: 'set', width: 330, render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><button className="table-link table-link-title" type="button" onClick={() => navigate(`/assets/${item.id}`)}>{item.title}</button><button className="table-link" type="button" onClick={() => navigate(`/assets/${item.id}`)}>{item.id}</button></div> },
    { title: '已关联分类', key: 'linkedCategories', width: 220, render: (_: unknown, item: QuestionSet) => { const summary = summarizeQuestionSetBindings(boundRows, item.id); return <div className="stacked-cell"><LinkedCategoryTags categories={summary.linkedCategories} counts={summary.linkedCategoryCounts} /><span>{summary.bindings.length ? `已关联 ${summary.bindings.length} 个目录` : '暂未关联目录'}</span></div> } },
    { title: '教学范围', key: 'scope', width: 170, render: (_: unknown, item: QuestionSet) => [item.scope.phase, item.scope.subject, item.scope.grade].filter(Boolean).join(' · ') || '-' },
    { title: '来源', key: 'source', render: (_: unknown, item: QuestionSet) => <div className="stacked-cell">{item.source.workbookId ? <a className="table-link table-link-title" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${item.source.workbookId}`} target="_blank" rel="noreferrer">{item.source.workbookName}</a> : <strong>人工组题</strong>}<span>{item.source.chapterPath}</span></div> },
    { title: '题量', dataIndex: 'questionCount', key: 'questionCount', width: 70 },
    { title: '状态', key: 'status', width: 100, render: (_: unknown, item: QuestionSet) => <MetisTag color={item.contentStatus === 'published' ? 'success' : 'warning'}>{item.contentStatus === 'published' ? '已上线' : '未上线'}</MetisTag> },
    { title: '操作', key: 'actions', width: 110, render: (_: unknown, item: QuestionSet) => {
      const summary = summarizeQuestionSetBindings(boundRows, item.id)
      const alreadyBoundCurrentNode = summary.bindings.some((binding) => binding.treeType === expectedTreeType && binding.nodeId === currentNode.id)
      const hasOtherBindings = summary.bindings.length > 0
      return <MetisButton type="primary" disabled={alreadyBoundCurrentNode} onClick={() => {
        const next: CatalogBinding = { id: `BIND-${Date.now()}`, treeType: expectedTreeType, nodePath: currentNode.label, nodeId: currentNode.id, setTitle: item.title, setId: item.id, primary: !summary.bindings.some((binding) => binding.treeType === expectedTreeType), region: '全国', status: '待生效', operator: '王晓慧', updatedAt: '刚刚' }
        catalogBindingRepository.add(next)
        setBoundRows(catalogBindingRepository.list())
        setQuestionSetDialogOpen(false)
        MetisMessage.success(`已将 ${item.id} 关联到 ${currentNode.label}`)
      }}>{alreadyBoundCurrentNode ? '当前节点已关联' : hasOtherBindings ? '继续关联' : '关联'}</MetisButton>
    } },
  ]

  const questionSetLibraryDialog = <MetisDialog title={`关联题单 · ${currentNode.label}`} open={questionSetDialogOpen} width={1240} footer={null} onCancel={() => setQuestionSetDialogOpen(false)}>
    <div className="question-set-picker">
      <MetisAlert type="info" showIcon message="题单可关联多个目录" description="已关联其他教材章节或专题节点的题单仍可继续关联；只有当前节点已关联时不可重复。" />
      <section className="question-set-picker-filter-card" aria-label="关联题单筛选">
        <div className="filter-card-heading"><strong>筛选题单</strong><MetisButton type="borderless" onClick={() => setPickerFiltersExpanded((value) => !value)}>{pickerFiltersExpanded ? '收起筛选' : '展开筛选'}</MetisButton></div>
        {pickerFiltersExpanded && <>
          <div className="filter-form-grid">
            <PickerFilterField label="题单ID"><MetisInput.TextArea autoSize={{ minRows: 1, maxRows: 3 }} value={pickerDraftFilters.id} placeholder="多个ID可分行输入" onChange={(event) => updatePickerDraftFilters({ id: event.target.value })} /></PickerFilterField>
            <PickerFilterField label="名称"><MetisInput value={pickerDraftFilters.title} placeholder="请输入题单名称" onChange={(event) => updatePickerDraftFilters({ title: event.target.value })} /></PickerFilterField>
            <PickerFilterField label="题目ID"><MetisInput value={pickerDraftFilters.questionId} placeholder="请输入题目ID" onChange={(event) => updatePickerDraftFilters({ questionId: event.target.value })} /></PickerFilterField>
            <PickerFilterField label="已关联分类"><MetisSelect allowClear value={pickerDraftFilters.linkedTreeType} placeholder="全部分类" options={[{ label: '同步练习树', value: '同步练习树' }, { label: '专题树', value: '专题树' }]} onChange={(value) => updatePickerDraftFilters({ linkedTreeType: value as CatalogTreeType | undefined })} /></PickerFilterField>
            <PickerFilterField label="年级"><MetisSelect allowClear value={pickerDraftFilters.grade} placeholder="全部年级" options={[{ label: '七年级', value: '七年级' }, { label: '八年级', value: '八年级' }, { label: '九年级', value: '九年级' }]} onChange={(value) => updatePickerDraftFilters({ grade: value ? String(value) : undefined })} /></PickerFilterField>
            <PickerFilterField label="学年"><MetisSelect allowClear value={pickerDraftFilters.academicYear} placeholder="全部学年" options={[{ label: '2026-2027学年', value: '2026-2027学年' }, { label: '2025-2026学年', value: '2025-2026学年' }, { label: '2024-2025学年', value: '2024-2025学年' }]} onChange={(value) => updatePickerDraftFilters({ academicYear: value ? String(value) : undefined })} /></PickerFilterField>
            <PickerFilterField label="学期"><MetisSelect allowClear value={pickerDraftFilters.semester} placeholder="全部学期" options={[{ label: '上学期', value: '上学期' }, { label: '下学期', value: '下学期' }]} onChange={(value) => updatePickerDraftFilters({ semester: value ? String(value) : undefined })} /></PickerFilterField>
            <PickerFilterField label="教材版本"><MetisSelect allowClear value={pickerDraftFilters.textbook} placeholder="全部教材版本" options={[{ label: '沪教版(五四制)', value: '沪教版' }, { label: '统编版', value: '统编版' }, { label: '多版本/通用', value: '多版本' }]} onChange={(value) => updatePickerDraftFilters({ textbook: value ? String(value) : undefined })} /></PickerFilterField>
            <PickerFilterField label="来源练习册ID"><MetisInput value={pickerDraftFilters.workbookId} placeholder="请输入练习册ID" onChange={(event) => updatePickerDraftFilters({ workbookId: event.target.value })} /></PickerFilterField>
            <PickerFilterField label="状态"><MetisSelect allowClear value={pickerDraftFilters.contentStatus} placeholder="全部状态" options={[{ label: '草稿', value: 'draft' }, { label: '已上线', value: 'published' }, { label: '已下线', value: 'offline' }]} onChange={(value) => updatePickerDraftFilters({ contentStatus: value as ContentStatus | undefined })} /></PickerFilterField>
            <PickerFilterField label="目录关联"><MetisSelect allowClear value={pickerDraftFilters.bindingStatus} placeholder="全部关联状态" options={[{ label: '已关联', value: 'bound' }, { label: '未关联', value: 'unbound' }]} onChange={(value) => updatePickerDraftFilters({ bindingStatus: value as BindingStatus | undefined })} /></PickerFilterField>
          </div>
          <div className="filter-actions"><MetisButton onClick={() => { setPickerDraftFilters(initialQuestionSetPickerFilters); setPickerAppliedFilters(initialQuestionSetPickerFilters) }}>重置</MetisButton><MetisButton type="primary" onClick={() => setPickerAppliedFilters({ ...pickerDraftFilters })}>搜索</MetisButton></div>
        </>}
      </section>
      <div className="question-set-picker-toolbar"><div><strong>题单列表</strong><span>当前筛选共 {selectableSets.length} 条</span></div></div>
      <MetisTable<QuestionSet> rowKey="id" columns={libraryColumns} dataSource={selectableSets} pagination={{ pageSize: 6 }} />
    </div>
  </MetisDialog>

  if (!isTextbook) {
    const topicBindingColumns = [
      { title: '题单ID / 名称', key: 'set', width: 360, render: (_: unknown, item: CatalogBinding) => <div className="stacked-cell"><button className="table-link table-link-title" type="button" onClick={() => navigate(`/assets/${item.setId}`)}>{item.setTitle}</button><button className="table-link" type="button" onClick={() => navigate(`/assets/${item.setId}`)}>{item.setId}</button></div> },
      { title: '已关联分类', key: 'linkedCategories', width: 240, render: (_: unknown, item: CatalogBinding) => { const summary = summarizeQuestionSetBindings(boundRows, item.setId); return <LinkedCategoryTags categories={summary.linkedCategories} counts={summary.linkedCategoryCounts} /> } },
      { title: '题量', key: 'count', width: 90, render: (_: unknown, item: CatalogBinding) => questionSets.find((set) => set.id === item.setId)?.questionCount ?? 18 },
      { title: '来源', key: 'source', render: (_: unknown, item: CatalogBinding) => { const set = questionSets.find((row) => row.id === item.setId); return set?.source.workbookId ? <a className="table-link" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${set.source.workbookId}`} target="_blank" rel="noreferrer">{set.source.workbookName}</a> : set?.source.chapterPath ?? '人工组题' } },
      { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <MetisTag color={value === '有效' ? 'success' : 'warning'}>{value}</MetisTag> },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 150 },
      { title: '操作', key: 'actions', width: 150, render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => navigate(`/assets/${item.setId}`)}>查看</MetisButton><MetisButton type="borderless" onClick={() => removeBinding(item.id)}>移除</MetisButton></div> },
    ]
    const topicHistoryColumns = [
      { title: '操作类型', dataIndex: 'action', key: 'action', width: 140 },
      { title: '操作内容', dataIndex: 'detail', key: 'detail' },
      { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
      { title: '操作时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 180 },
    ]

    return (
      <div className="page-container topic-tree-page">
        <header className="topic-page-banner" data-sec="1">
          <span className="breadcrumb">内容库 / 标签管理 / 专题树</span>
          <h1>专题树</h1>
        </header>

        <section className="topic-tree-workbench" data-sec="2">
          <aside className="topic-tree-sidebar" aria-label="专题树">
            <MetisSelect value="middle-math-topic" options={[{ label: '初中 / 数学', value: 'middle-math-topic' }]} />
            <MetisInput placeholder="搜索专题名称或ID" />
            <div className="topic-tree-actions"><MetisButton type="borderless">全部展开</MetisButton><MetisButton type="borderless" onClick={() => MetisMessage.info('进入专题节点排序')}>排序</MetisButton><MetisButton type="borderless" onClick={() => MetisMessage.info('新建一级专题')}>＋ 新建一级专题</MetisButton></div>
            <div className="topic-tree-list">
              {nodes.map((node) => <button key={node.id} type="button" className={`${selectedNode === node.id ? 'active' : ''} level-${node.level}`} onClick={() => setSelectedNode(node.id)}><span>{node.level === 0 ? '▾ ' : ''}{node.label}</span>{node.status && <MetisTag color={node.status === '上线' ? 'success' : 'default'}>{node.status}</MetisTag>}</button>)}
            </div>
          </aside>

          <div className="topic-tree-main">
            <section className="topic-node-card" data-sec="3">
              <div><div className="topic-node-title"><h2>{currentNode.label}</h2><MetisButton type="borderless" onClick={() => MetisMessage.info('编辑当前专题节点')}>编辑</MetisButton></div><p>ID：{currentNode.id}</p></div>
              <MetisTag color={currentNode.status === '下线' ? 'default' : 'success'}>{currentNode.status ?? '上线'}</MetisTag>
            </section>

            <section className="topic-assets-card" data-sec="4">
              <MetisTabs activeKey={topicPanel} items={[{ key: 'sets', label: `关联题单（${bindings.length}）` }, { key: 'history', label: '操作记录' }]} onChange={(key) => setTopicPanel(key as 'sets' | 'history')} />
              {topicPanel === 'sets' ? <>
                <div className="topic-set-toolbar">
                  <div><MetisButton type="borderless">全选本页</MetisButton><MetisButton type="borderless" disabled>移出</MetisButton><MetisButton type="borderless" disabled>移动到</MetisButton></div>
                  <MetisButton type="borderless" onClick={() => setQuestionSetDialogOpen(true)}>＋ 关联题单</MetisButton>
                </div>
                <MetisTable<CatalogBinding> rowKey="id" columns={topicBindingColumns} dataSource={bindings} pagination={{ pageSize: 10 }} />
              </> : <MetisTable rowKey="id" columns={topicHistoryColumns} dataSource={topicHistory} pagination={false} />}
            </section>
          </div>
        </section>
        {questionSetLibraryDialog}
      </div>
    )
  }

  return (
    <div className="page-container textbook-tree-page">
      <header className="textbook-page-banner" data-sec="1">
        <div><span className="breadcrumb">内容库 / 标签管理 / 教材目录</span><h1>教材目录</h1></div>
        <MetisButton onClick={() => MetisMessage.info('打开批量关联知识点')}>批量关联知识点</MetisButton>
      </header>

      <section className="textbook-tree-workbench" data-sec="2">
        <aside className="textbook-tree-sidebar" aria-label="教材目录树">
          <div className="textbook-filter-row">
            <MetisSelect value="middle-math" options={[{ label: '初中 / 数学', value: 'middle-math' }]} />
            <MetisSelect value="hj-2024" options={[{ label: '沪教版', value: 'hj-2024' }]} />
            <MetisSelect value="all" options={[{ label: '全部', value: 'all' }, { label: '上线', value: 'online' }, { label: '下线', value: 'offline' }]} />
          </div>
          <MetisInput placeholder="请输入搜索内容" />
          <div className="textbook-tree-actions"><MetisButton type="borderless">全部展开</MetisButton><MetisButton type="borderless" onClick={() => MetisMessage.info('进入教材排序')}>排序</MetisButton><MetisButton type="borderless" onClick={() => MetisMessage.info('新建教材')}>＋ 新建教材</MetisButton></div>
          <div className="catalog-node-list">
            {nodes.map((node) => <button key={node.id} type="button" className={`${selectedNode === node.id ? 'active' : ''} level-${node.level}`} onClick={() => setSelectedNode(node.id)}><span>{node.label}</span><span className="node-meta">{node.status && <MetisTag color={node.status === '上线' ? 'success' : 'default'}>{node.status}</MetisTag>}<small>{node.relationCount}</small></span></button>)}
          </div>
        </aside>

        <div className="textbook-tree-main">
          <section className="textbook-node-actions" data-sec="3">
            <h2><span>[{currentNode.level === 0 ? '教材' : currentNode.level === 1 ? '章节' : '节'}]</span> {currentNode.label}</h2>
            <div><MetisButton onClick={() => MetisMessage.info('合并到其他章节')}>合并到其他章节</MetisButton><MetisButton onClick={() => MetisMessage.info('复制到其他章节')}>复制到其他章节</MetisButton></div>
          </section>

          <section className="textbook-basic-card" data-sec="4">
            <div className="textbook-card-heading"><strong>基本信息</strong><MetisButton onClick={() => MetisMessage.info('编辑基本信息')}>编辑</MetisButton></div>
            <dl><div><dt>ID</dt><dd>{currentNode.id}</dd></div><div><dt>入库顺序</dt><dd>1</dd></div><div><dt>章节序号</dt><dd>{currentNode.level === 2 ? '2' : '1'}</dd></div><div><dt>章节名称</dt><dd>{currentNode.label}</dd></div><div><dt>章节类型</dt><dd>{currentNode.level === 0 ? '教材' : '正式章节'}</dd></div><div><dt>所需课时数</dt><dd>{currentNode.level === 0 ? '-' : '1'}</dd></div><div><dt>上下线状态</dt><dd>{currentNode.status ?? '上线'}</dd></div></dl>
          </section>

          <section className="textbook-relations-card" data-sec="5">
          <MetisTabs activeKey={relationTab} items={textbookRelationItems} onChange={(key) => setRelationTab(key as RelationTab)} />

          {relationTab === 'questionSet' ? <div className="relation-panel textbook-question-set-panel">
            <div className="textbook-question-set-heading"><h3>关联题单</h3><MetisButton type="borderless" onClick={() => setQuestionSetDialogOpen(true)}>＋ 关联题单</MetisButton></div>
            <MetisTable<CatalogBinding> rowKey="id" columns={textbookQuestionSetColumns} dataSource={bindings} pagination={false} />
          </div> : <div className="relation-panel">
            {relationTab === 'question' && <div className="question-relation-filters">
              <label><strong>状态</strong><MetisSelect allowClear placeholder="全部状态" options={[{ label: '上线', value: 'online' }, { label: '下线', value: 'offline' }]} /></label>
              <label><strong>来源</strong><MetisSelect allowClear placeholder="全部来源" options={[{ label: 'tarzan', value: 'tarzan' }, { label: '口算知识应用', value: 'mental' }, { label: 'cyber', value: 'cyber' }, { label: '原创', value: 'original' }, { label: '后台', value: 'backend' }, { label: '任务平台', value: 'task' }, { label: 'XES', value: 'xes' }, { label: '自动出题（原创）', value: 'auto' }, { label: '菁优网', value: 'jyeoo' }, { label: '教师工作台', value: 'teacher' }]} /></label>
              <label><strong>题目分层</strong><MetisSelect allowClear placeholder="全部分层" options={[{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }, { label: 'D', value: 'D' }]} /></label>
              <label><strong>可见资源库</strong><MetisSelect allowClear placeholder="全部资源库" options={[{ label: '飞象公共库', value: 'public' }, { label: '校本资源库', value: 'school' }, { label: '区域资源库', value: 'region' }]} /></label>
              <label><strong>难度</strong><MetisSelect allowClear placeholder="全部难度" options={[{ label: '容易', value: 'easy' }, { label: '较易', value: 'easier' }, { label: '中等', value: 'medium' }, { label: '较难', value: 'harder' }, { label: '困难', value: 'hard' }]} /></label>
            </div>}
            <div className="relation-toolbar"><div><strong>已关联{relationLabel}</strong><span>关联关系仅作用于当前目录节点</span></div><div><MetisInput placeholder={`按${relationLabel}名称或ID搜索`} /><MetisButton>搜索</MetisButton></div></div>
            <MetisTable<RelatedResource> rowKey="id" columns={resourceColumns} dataSource={resourcesByTab[relationTab]} pagination={false} />
          </div>}
          </section>
        </div>
      </section>
      {questionSetLibraryDialog}
    </div>
  )
}
