import { useEffect, useMemo, useState } from 'react'
import { MetisButton, MetisEmpty, MetisMessage, MetisTable, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { useNavigate, useParams } from 'react-router-dom'
import { ContentStatusTag, MethodLabel, TypeTag } from '../components/StatusTags'
import { detailQuestions, generationJobs } from '../data/mockData'
import type { GenerationJob, QuestionItem, QuestionSet } from '../features/question-sets/types'
import { questionSetRepository } from '../services/questionSetRepository'

export function QuestionSetDetailPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState(detailQuestions)
  const [activeTab, setActiveTab] = useState('content')

  useEffect(() => {
    setLoading(true)
    void questionSetRepository.get(id).then((item) => { setRecord(item); setLoading(false) })
  }, [id])

  const moveQuestion = (questionId: string, delta: number) => {
    setQuestions((current) => {
      const sourceIndex = current.findIndex((item) => item.id === questionId)
      const targetIndex = sourceIndex + delta
      if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= current.length) return current
      const next = [...current]
      const [moved] = next.splice(sourceIndex, 1)
      next.splice(targetIndex, 0, moved)
      return next.map((item, index) => ({ ...item, order: index + 1 }))
    })
  }

  const questionColumns = useMemo(() => [
    { title: '序号', dataIndex: 'order', key: 'order', width: 70 },
    { title: '题目内容', key: 'stem', render: (_: unknown, item: QuestionItem) => <div className="question-title-cell"><div><button type="button">{item.id}</button><MetisTag>{item.group}</MetisTag></div><p>{item.stem}</p><span>{item.sourceModule} · 题目版本 {item.revision}</span></div> },
    { title: '题型', dataIndex: 'type', key: 'type', width: 110 },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 100 },
    { title: '来源', key: 'origin', width: 120, render: (_: unknown, item: QuestionItem) => <MetisTag color={item.origin === 'manual' ? 'purple' : 'processing'}>{item.origin === 'manual' ? '人工添加' : '来源继承'}</MetisTag> },
    { title: '操作', key: 'actions', width: 190, render: (_: unknown, item: QuestionItem) => <div className="table-actions"><MetisButton type="borderless" disabled={item.order === 1} onClick={() => moveQuestion(item.id, -1)}>上移</MetisButton><MetisButton type="borderless" onClick={() => moveQuestion(item.id, 1)}>下移</MetisButton><MetisButton type="borderless" onClick={() => setQuestions((rows) => rows.filter((row) => row.id !== item.id))}>移除</MetisButton></div> },
  ], [])

  if (loading) return <div className="page-container"><div className="loading-card">正在加载题单…</div></div>
  if (!record) return <div className="page-container"><div className="feedback-state"><MetisEmpty description="未找到该题单" /><MetisButton onClick={() => navigate('/assets')}>返回题单库</MetisButton></div></div>

  const matchedProductionRows = generationJobs.filter((job) => !record.source.workbookId || job.workbookId === record.source.workbookId)
  const productionRows: GenerationJob[] = matchedProductionRows.length ? matchedProductionRows : [{ id: 'JOB-20261014-8554', trigger: '自动事件', workbook: record.source.workbookName ?? '人工组题', workbookId: record.source.workbookId ?? '-', ruleVersion: record.source.ruleVersion ?? '-', eligible: 1, created: 1, updated: 0, skipped: 0, conflict: 0, failed: 0, status: 'success', startedAt: '2026-10-14 09:42', duration: '18秒', initiator: '系统' }]
  const productionColumns = [
    { title: '生产记录ID', dataIndex: 'id', key: 'id', width: 190 },
    { title: '触发方式', dataIndex: 'trigger', key: 'trigger', width: 130 },
    { title: '来源练习册', key: 'workbook', render: (_: unknown, item: GenerationJob) => <div className="stacked-cell"><strong>{item.workbook}</strong><span>{item.workbookId}</span></div> },
    { title: '生成规则', dataIndex: 'ruleVersion', key: 'ruleVersion', width: 130 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 110, render: (value: GenerationJob['status']) => <MetisTag color={value === 'success' ? 'success' : value === 'failed' ? 'error' : 'warning'}>{value === 'success' ? '成功' : value === 'failed' ? '失败' : value === 'running' ? '生成中' : '部分成功'}</MetisTag> },
    { title: '发起人 / 时间', key: 'initiator', width: 190, render: (_: unknown, item: GenerationJob) => `${item.initiator} · ${item.startedAt}` },
  ]

  const contentTab = <div className="question-set-content-tab" data-sec="3"><div className="section-toolbar"><div><strong>题单内容</strong><span>共 {questions.length} 道题，按当前顺序展示</span></div><MetisButton onClick={() => MetisMessage.info('打开题库选题弹窗')}>＋ 添加题目</MetisButton></div><MetisTable<QuestionItem> rowKey="id" columns={questionColumns} dataSource={questions} pagination={false} /></div>
  const operationTab = <div className="detail-section" data-sec="4"><div className="audit-list"><div><time>2026-10-21 17:46</time><strong>王晓慧编辑题单</strong><p>调整题目顺序，更新题单标签。</p></div><div><time>2026-10-20 16:08</time><strong>系统同步来源变化</strong><p>来源章节新增 3 题，更新题单内容。</p></div><div><time>2026-10-14 10:00</time><strong>赵琪关联教材目录</strong><p>关联至教材章节 {record.source.chapterIds.join('、') || '-'}。</p></div></div></div>
  const productionTab = <div className="detail-section" data-sec="5">{productionRows.length ? <MetisTable<GenerationJob> rowKey="id" columns={productionColumns} dataSource={productionRows} pagination={false} /> : <MetisEmpty description="暂无生产记录" />}</div>

  return <div className="page-container question-set-detail-page">
    <header className="question-set-detail-banner" data-sec="1"><span className="breadcrumb">内容库 / 题单库 / 题单详情</span><div className="question-set-detail-title"><h1>{record.title}</h1><ContentStatusTag value={record.contentStatus} /></div></header>
    <section className="question-set-basic-card" data-sec="2">
      <div className="question-set-basic-heading"><strong>基本信息</strong><MetisButton type="borderless" onClick={() => MetisMessage.info('编辑题单基本信息')}>编辑</MetisButton></div>
      <dl>
        <div><dt>题单ID</dt><dd>{record.id}</dd></div><div><dt>类型</dt><dd><TypeTag value={record.type} /></dd></div>
        <div><dt>题单名称</dt><dd>{record.title}</dd></div><div><dt>生产方式</dt><dd><MethodLabel value={record.method} /></dd></div>
        <div><dt>阶段 / 科目</dt><dd>{record.scope.phase} / {record.scope.subject}</dd></div><div><dt>年级 / 册次</dt><dd>{record.scope.grade} / {record.scope.volume}</dd></div>
        <div><dt>教材版本</dt><dd>{record.scope.textbook}</dd></div><div><dt>题量 / 建议时长</dt><dd>{record.questionCount} 题 / {record.duration} 分钟</dd></div>
        <div><dt>综合难度</dt><dd>{record.difficulty}</dd></div><div><dt>负责人</dt><dd>{record.owner}</dd></div>
        <div><dt>来源练习册</dt><dd>{record.source.workbookName ?? '-'}</dd></div><div><dt>来源章节</dt><dd>{record.source.chapterPath || '-'}</dd></div>
        <div><dt>标签</dt><dd>{record.tags.join('、') || '-'}</dd></div><div><dt>更新时间</dt><dd>{record.updatedAt}</dd></div>
      </dl>
    </section>
    <section className="question-set-detail-tabs"><MetisTabs activeKey={activeTab} onChange={setActiveTab} items={[{ key: 'content', label: '题单内容', children: contentTab }, { key: 'operations', label: '操作记录', children: operationTab }, { key: 'production', label: '生产记录', children: productionTab }]} /></section>
  </div>
}
