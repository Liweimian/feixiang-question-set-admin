import { useEffect, useMemo, useState } from 'react'
import { MetisButton, MetisDialog, MetisEmpty, MetisInput, MetisMessage, MetisSelect, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ContentStatusTag, LinkedCategoryTags, MethodLabel } from '../components/StatusTags'
import { detailQuestions } from '../data/mockData'
import type { CatalogBinding, CatalogTreeType, QuestionSet, QuestionStatus } from '../features/question-sets/types'
import { catalogBindingRepository, summarizeQuestionSetBindings } from '../services/catalogBindingRepository'
import { questionSetRepository } from '../services/questionSetRepository'

const editableDirectoryOptions: Record<CatalogTreeType, { label: string; value: string }[]> = {
  同步练习树: [
    { label: '沪教版(五四制)(2024) 八年级上册 / 第19章 实数 / 19.1 算术平方根', value: 'TC-310418' },
    { label: '沪教版(五四制)(2024) 八年级上册 / 第19章 实数 / 19.2 平方根与立方根', value: 'TC-310419' },
    { label: '沪教版(五四制)(2024) 八年级上册 / 第20章 二次根式 / 20.2 分母有理化', value: 'TC-320473' },
  ],
  专题树: [
    { label: '知识模块 / 数与式 / 二次根式', value: 'TOPIC-2201' },
    { label: '知识模块 / 方程 / 一元二次方程', value: 'TOPIC-2402' },
    { label: '难点突破 / 分母有理化', value: 'TOPIC-5508' },
  ],
}

export function QuestionSetDetailPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [searchParams] = useSearchParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [bindings, setBindings] = useState<CatalogBinding[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [selectedQuestionId, setSelectedQuestionId] = useState(detailQuestions[0].id)
  const [questionIdDraft, setQuestionIdDraft] = useState('')
  const [questionStatusDraft, setQuestionStatusDraft] = useState<'all' | QuestionStatus>('all')
  const [questionFilters, setQuestionFilters] = useState<{ questionIds: string; status: 'all' | QuestionStatus }>({ questionIds: '', status: 'all' })
  const [editBasicOpen, setEditBasicOpen] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [textbookDirectoryDraft, setTextbookDirectoryDraft] = useState<string[]>([])
  const [topicDirectoryDraft, setTopicDirectoryDraft] = useState<string[]>([])

  const filteredQuestions = useMemo(() => {
    const ids = questionFilters.questionIds.split(/\s+/).map((value) => value.trim()).filter(Boolean)
    return detailQuestions.filter((item) => (
      (!ids.length || ids.includes(item.id))
      && (questionFilters.status === 'all' || item.status === questionFilters.status)
    ))
  }, [questionFilters])

  useEffect(() => {
    setLoading(true)
    void Promise.all([questionSetRepository.get(id), questionSetRepository.getBindings(id)]).then(([item, relationRows]) => {
      setRecord(item)
      setBindings(relationRows)
      setLoading(false)
    })
  }, [id])

  useEffect(() => {
    const requestedTab = searchParams.get('tab')
    if (requestedTab === 'operations') setActiveTab(requestedTab)
  }, [searchParams])

  useEffect(() => {
    if (filteredQuestions.length && !filteredQuestions.some((item) => item.id === selectedQuestionId)) {
      setSelectedQuestionId(filteredQuestions[0].id)
    }
  }, [filteredQuestions, selectedQuestionId])

  if (loading) return <div className="page-container"><div className="loading-card">正在加载题单…</div></div>
  if (!record) return <div className="page-container"><div className="feedback-state"><MetisEmpty description="未找到该题单" /><MetisButton onClick={() => navigate('/assets')}>返回题单库</MetisButton></div></div>

  const bindingSummary = summarizeQuestionSetBindings(bindings, record.id)
  const openBasicEditor = () => {
    setTagDraft([...record.tags, record.difficulty].filter(Boolean).join('、'))
    setTextbookDirectoryDraft(bindings.filter((item) => item.treeType === '同步练习树').map((item) => item.nodeId))
    setTopicDirectoryDraft(bindings.filter((item) => item.treeType === '专题树').map((item) => item.nodeId))
    setEditBasicOpen(true)
  }
  const saveBasicEditor = () => {
    const tags = tagDraft.split(/[、,，\n]/).map((value) => value.trim()).filter(Boolean)
    const buildBindings = (treeType: CatalogTreeType, nodeIds: string[]) => nodeIds.map((nodeId, index): CatalogBinding => {
      const option = editableDirectoryOptions[treeType].find((item) => item.value === nodeId)
      return { id: `BIND-${record.id}-${treeType}-${nodeId}`, treeType, nodeId, nodePath: option?.label ?? nodeId, setId: record.id, setTitle: record.title, primary: index === 0, region: '全国', status: '有效', operator: '王晓慧', updatedAt: '刚刚' }
    })
    const nextBindings = [...buildBindings('同步练习树', textbookDirectoryDraft), ...buildBindings('专题树', topicDirectoryDraft)]
    catalogBindingRepository.replaceForQuestionSet(record.id, nextBindings)
    setBindings(nextBindings)
    setRecord({ ...record, tags, difficulty: '' })
    setEditBasicOpen(false)
    MetisMessage.success('题单标签和关联目录已更新')
  }

  const questionGroups = Array.from(new Set(detailQuestions.map((item) => item.group)))
  const listContentView = <div className="question-management-view">
    <div className="question-management-layout">
      <div className="question-management-left">
        <div className="question-module-toolbar"><span>模块设置：</span><MetisSelect value="group" disabled options={[{ label: '有模块', value: 'group' }]} /></div>
        <aside className="question-order-panel"><header><strong>排序</strong><div><button type="button">导出</button><button type="button" onClick={() => MetisMessage.info('打开关联题目弹窗')}>＋新建模块</button></div></header>{questionGroups.map((group) => <section key={group} className="question-order-group"><header><strong>▾　{group}</strong><button type="button" onClick={() => MetisMessage.info(`向${group}关联题目`)}>＋关联题目</button></header>{detailQuestions.filter((item) => item.group === group).map((item) => <button key={item.id} type="button" className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><span>{item.order}、{item.id}</span><MetisTag color={item.status === 'online' ? 'success' : 'default'}>{item.status === 'online' ? '上线' : '下线'}</MetisTag><em>移出</em></button>)}</section>)}</aside>
      </div>
      <div className="question-management-right">
        <div className="question-management-filters"><span>题目ID：</span><MetisInput value={questionIdDraft} placeholder="请输入ID，多个换行分割" onChange={(event) => setQuestionIdDraft(event.target.value)} /><span>题目状态：</span><MetisSelect value={questionStatusDraft} options={[{ label: '全部', value: 'all' }, { label: '上线', value: 'online' }, { label: '下线', value: 'offline' }]} onChange={(value) => setQuestionStatusDraft(value as 'all' | QuestionStatus)} /><MetisButton type="primary" onClick={() => setQuestionFilters({ questionIds: questionIdDraft.trim(), status: questionStatusDraft })}>查询</MetisButton><MetisButton onClick={() => { setQuestionIdDraft(''); setQuestionStatusDraft('all'); setQuestionFilters({ questionIds: '', status: 'all' }) }}>重置</MetisButton></div>
        <section className="question-card-list">{filteredQuestions.length ? filteredQuestions.map((item) => <article key={item.id} className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><header><button className="table-link table-link-title" type="button">{item.id}</button><MetisTag color={item.status === 'online' ? 'success' : 'default'}>{item.status === 'online' ? '上线' : '下线'}</MetisTag><strong>{item.type}</strong><span>来源：{item.origin === 'source' ? '练习册' : '人工添加'}</span><span>题目版本：{item.revision}</span></header><div className="question-card-meta"><span>出处：{item.sourceModule}</span><span>难度：{item.difficulty}</span><span>题目分层：{item.group}</span></div><div className="question-card-tags"><MetisTag>有解析</MetisTag><MetisTag>有答案</MetisTag><MetisTag>有难度</MetisTag><MetisTag>有学科题型</MetisTag></div><p><strong>{item.order}.</strong> {item.stem}</p></article>) : <MetisEmpty description="暂无符合条件的题目" />}</section>
      </div>
    </div>
  </div>

  const contentTab = <div data-sec="3">{listContentView}</div>
  const operationTab = <div className="detail-section" data-sec="4"><div className="audit-list"><div><time>2026-10-21 17:46</time><strong>王晓慧编辑题单</strong><p>调整题目顺序，更新题单标签。</p></div><div><time>2026-10-20 16:08</time><strong>系统同步来源变化</strong><p>来源章节新增 3 题，更新题单内容。</p></div><div><time>2026-10-14 10:00</time><strong>赵琪关联教材目录</strong><p>关联至教材章节 {record.source.chapterIds.join('、') || '-'}。</p></div></div></div>
  return <div className="page-container question-set-detail-page">
    <header className="question-set-detail-banner" data-sec="1"><span className="breadcrumb">内容库 / 题单库 / 题单详情</span><div className="question-set-detail-title"><h1>{record.title}</h1><ContentStatusTag value={record.contentStatus} /></div></header>
    <section className="question-set-basic-card" data-sec="2">
      <div className="question-set-basic-heading"><strong>基本信息</strong><MetisButton type="borderless" onClick={openBasicEditor}>编辑</MetisButton></div>
      <dl>
        <div><dt>题单ID</dt><dd>{record.id}</dd></div><div><dt>已关联分类</dt><dd><LinkedCategoryTags categories={bindingSummary.linkedCategories} counts={bindingSummary.linkedCategoryCounts} /></dd></div>
        <div><dt>题单名称</dt><dd>{record.title}</dd></div><div><dt>生产方式</dt><dd><MethodLabel value={record.method} /></dd></div>
        <div><dt>阶段 / 科目</dt><dd>{record.scope.phase} / {record.scope.subject}</dd></div><div><dt>年级 / 学期</dt><dd>{record.scope.grade || '-'} / {record.scope.semester ?? (record.scope.volume ? record.scope.volume.replace('册', '学期') : '-')}</dd></div>
        <div><dt>教材版本</dt><dd>{record.scope.textbook || '-'}</dd></div>
        <div><dt>来源练习册</dt><dd>{record.source.workbookId ? <a className="table-link" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${record.source.workbookId}`} target="_blank" rel="noreferrer">{record.source.workbookName}</a> : '-'}</dd></div><div><dt>来源章节</dt><dd>{record.source.chapterPath || '-'}</dd></div>
        <div className="question-set-bindings-row"><dt>关联目录</dt><dd>{bindings.length ? bindings.map((binding) => <button key={binding.id} className="directory-link-chip" type="button" onClick={() => navigate(`${binding.treeType === '同步练习树' ? '/catalogs' : '/topic-tree'}?node=${encodeURIComponent(binding.nodeId)}`)}><span>{binding.treeType}</span>{binding.nodePath}</button>) : <span>暂无关联目录</span>}</dd></div>
        <div className="question-set-tags-row"><dt>标签</dt><dd>{[...record.tags, record.difficulty].filter(Boolean).map((tag) => <MetisTag key={tag}>{tag}</MetisTag>)}</dd></div>
      </dl>
    </section>
    <section className="question-set-detail-tabs"><MetisTabs activeKey={activeTab} onChange={setActiveTab} items={[{ key: 'content', label: `题目（${record.questionCount}）`, children: contentTab }, { key: 'operations', label: '操作记录', children: operationTab }]} /></section>
    <MetisDialog title="编辑题单基本信息" open={editBasicOpen} width={760} footer={<div className="dialog-footer-actions"><MetisButton onClick={() => setEditBasicOpen(false)}>取消</MetisButton><MetisButton type="primary" onClick={saveBasicEditor}>保存</MetisButton></div>} onCancel={() => setEditBasicOpen(false)}>
      <div className="question-set-basic-editor">
        <label className="field-stack"><span>标签</span><MetisInput.TextArea autoSize={{ minRows: 2, maxRows: 4 }} value={tagDraft} placeholder="多个标签使用顿号或逗号分隔" onChange={(event) => setTagDraft(event.target.value)} /></label>
        <label className="field-stack"><span>教材目录树</span><MetisSelect mode="multiple" allowClear value={textbookDirectoryDraft} placeholder="请选择教材章节，可多选" options={editableDirectoryOptions.同步练习树} onChange={(value) => setTextbookDirectoryDraft(value as string[])} /></label>
        <label className="field-stack"><span>专题树</span><MetisSelect mode="multiple" allowClear value={topicDirectoryDraft} placeholder="请选择专题节点，可多选" options={editableDirectoryOptions.专题树} onChange={(value) => setTopicDirectoryDraft(value as string[])} /></label>
        <p className="form-help">保存后将按当前选择新增或解除目录关系；同一题单可同时关联两类目录及多个节点。</p>
      </div>
    </MetisDialog>
  </div>
}
