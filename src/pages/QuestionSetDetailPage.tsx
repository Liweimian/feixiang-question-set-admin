import { useEffect, useState } from 'react'
import { MetisButton, MetisEmpty, MetisInput, MetisMessage, MetisSelect, MetisTable, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { useNavigate, useParams } from 'react-router-dom'
import { ContentStatusTag, MethodLabel, TypeTag } from '../components/StatusTags'
import { detailQuestions, generationJobs } from '../data/mockData'
import type { GenerationJob, QuestionSet } from '../features/question-sets/types'
import { questionSetRepository } from '../services/questionSetRepository'

export function QuestionSetDetailPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [selectedQuestionId, setSelectedQuestionId] = useState(detailQuestions[0].id)
  const [contentMode, setContentMode] = useState<'list' | 'edit'>('list')

  useEffect(() => {
    setLoading(true)
    void questionSetRepository.get(id).then((item) => { setRecord(item); setLoading(false) })
  }, [id])

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

  const selectedQuestion = detailQuestions.find((item) => item.id === selectedQuestionId) ?? detailQuestions[0]
  const questionGroups = Array.from(new Set(detailQuestions.map((item) => item.group)))
  const editContentView = <div className="question-preview">
    <div className="question-preview-toolbar"><div><strong>编辑题单内容</strong><span>点击题号定位题目，可查看题目详情并调整整套题单</span></div><div><MetisButton onClick={() => navigate(`/assets/${record.id}/edit`)}>添加题目</MetisButton><MetisButton type="primary" onClick={() => { setContentMode('list'); MetisMessage.success('题单内容已保存') }}>保存并退出编辑</MetisButton></div></div>
    <div className="question-preview-layout">
      <aside className="question-outline"><h3>题目排序</h3><p>点击题号定位题目</p>{questionGroups.map((group) => <section key={group}><strong>{group}</strong><div>{detailQuestions.filter((item) => item.group === group).map((item) => <button key={item.id} type="button" className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}>{item.order}</button>)}</div></section>)}</aside>
      <section className="question-paper"><header><h2>{record.title}</h2><p>{record.scope.phase} · {record.scope.subject} · {record.scope.grade || '通用'} · 共 {record.questionCount} 题</p></header>{questionGroups.map((group) => <section key={group}><h3>{group}</h3>{detailQuestions.filter((item) => item.group === group).map((item) => <article key={item.id} className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><span>{item.order}.</span><p>{item.stem}</p></article>)}</section>)}</section>
      <aside className="question-inspector"><h3>题目信息</h3><dl><div><dt>题目ID</dt><dd>{selectedQuestion.id}</dd></div><div><dt>题型</dt><dd>{selectedQuestion.type}</dd></div><div><dt>难度</dt><dd>{selectedQuestion.difficulty}</dd></div><div><dt>来源</dt><dd>{selectedQuestion.sourceModule}</dd></div><div><dt>题目版本</dt><dd>{selectedQuestion.revision}</dd></div></dl><section><strong>答案</strong><p>{selectedQuestion.type === '填空题' ? '0，0和1' : selectedQuestion.type === '解答题' ? '结合数轴分情况讨论。' : 'C'}</p></section><section><strong>解析</strong><p>本题用于考查算术平方根的概念与基本性质，需结合定义判断。</p></section></aside>
    </div>
  </div>

  const listContentView = <div className="question-management-view">
    <div className="question-management-heading"><div><strong>题目列表</strong><span>共 {record.questionCount} 道题，当前展示 {detailQuestions.length} 道样例题</span></div><MetisButton type="primary" onClick={() => setContentMode('edit')}>编辑题单内容</MetisButton></div>
    <div className="question-management-filters"><span>模块设置：</span><MetisSelect value="none" disabled options={[{ label: '无模块', value: 'none' }]} /><MetisSelect value="group" options={[{ label: '大题参与编号', value: 'group' }]} /><span>题目ID：</span><MetisInput placeholder="请输入ID，多个换行分割" /><span>题目生产状态：</span><MetisSelect value="all" options={[{ label: '全部', value: 'all' }, { label: '上线', value: 'online' }]} /><MetisButton type="primary">查询</MetisButton><MetisButton>重置</MetisButton></div>
    <div className="question-management-layout">
      <aside className="question-order-panel"><header><strong>排序/分值</strong><div><button type="button">导出</button><button type="button" onClick={() => navigate(`/assets/${record.id}/edit`)}>＋关联题目</button></div></header>{detailQuestions.map((item) => <button key={item.id} type="button" className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><span>{item.order}、{item.id}</span><MetisTag color={item.quality === 'warning' ? 'warning' : 'success'}>{item.quality === 'warning' ? '待检查' : '上线'}</MetisTag><small>0.00分</small></button>)}</aside>
      <section className="question-card-list">{detailQuestions.map((item) => <article key={item.id} className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><header><button className="table-link table-link-title" type="button">{item.id}</button><MetisTag color="success">上线</MetisTag><strong>{item.type}</strong><span>来源：{item.origin === 'source' ? '练习册' : '人工添加'}</span><span>题目版本：{item.revision}</span></header><div className="question-card-meta"><span>出处：{item.sourceModule}</span><span>难度：{item.difficulty}</span><span>题目分层：{item.group}</span></div><div className="question-card-tags"><MetisTag>有解析</MetisTag><MetisTag>有答案</MetisTag><MetisTag>有难度</MetisTag><MetisTag>有学科题型</MetisTag></div><p><strong>{item.order}.</strong> {item.stem}</p></article>)}</section>
    </div>
  </div>

  const contentTab = <div data-sec="3">{contentMode === 'list' ? listContentView : editContentView}</div>
  const operationTab = <div className="detail-section" data-sec="4"><div className="audit-list"><div><time>2026-10-21 17:46</time><strong>王晓慧编辑题单</strong><p>调整题目顺序，更新题单标签。</p></div><div><time>2026-10-20 16:08</time><strong>系统同步来源变化</strong><p>来源章节新增 3 题，更新题单内容。</p></div><div><time>2026-10-14 10:00</time><strong>赵琪关联教材目录</strong><p>关联至教材章节 {record.source.chapterIds.join('、') || '-'}。</p></div></div></div>
  const productionTab = <div className="detail-section" data-sec="5">{productionRows.length ? <MetisTable<GenerationJob> rowKey="id" columns={productionColumns} dataSource={productionRows} pagination={false} /> : <MetisEmpty description="暂无生产记录" />}</div>

  return <div className="page-container question-set-detail-page">
    <header className="question-set-detail-banner" data-sec="1"><span className="breadcrumb">内容库 / 题单库 / 题单详情</span><div className="question-set-detail-title"><h1>{record.title}</h1><ContentStatusTag value={record.contentStatus} /></div></header>
    <section className="question-set-basic-card" data-sec="2">
      <div className="question-set-basic-heading"><strong>基本信息</strong><MetisButton type="borderless" onClick={() => MetisMessage.info('编辑题单基本信息')}>编辑</MetisButton></div>
      <dl>
        <div><dt>题单ID</dt><dd>{record.id}</dd></div><div><dt>类型</dt><dd><TypeTag value={record.type} /></dd></div>
        <div><dt>题单名称</dt><dd>{record.title}</dd></div><div><dt>生产方式</dt><dd><MethodLabel value={record.method} /></dd></div>
        <div><dt>阶段 / 科目</dt><dd>{record.scope.phase} / {record.scope.subject}</dd></div><div><dt>年级 / 学期</dt><dd>{record.type === 'topic' ? '-' : `${record.scope.grade} / ${record.scope.semester ?? record.scope.volume.replace('册', '学期')}`}</dd></div>
        <div><dt>教材版本</dt><dd>{record.type === 'topic' ? '-' : record.scope.textbook}</dd></div><div><dt>题量 / 建议时长</dt><dd>{record.questionCount} 题 / {record.duration} 分钟</dd></div>
        <div><dt>综合难度</dt><dd>{record.difficulty}</dd></div><div><dt>负责人</dt><dd>{record.owner}</dd></div>
        <div><dt>来源练习册</dt><dd>{record.source.workbookId ? <a className="table-link" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${record.source.workbookId}`} target="_blank" rel="noreferrer">{record.source.workbookName}</a> : '-'}</dd></div><div><dt>来源章节</dt><dd>{record.source.chapterPath || '-'}</dd></div>
        <div><dt>标签</dt><dd>{record.tags.join('、') || '-'}</dd></div><div><dt>更新时间</dt><dd>{record.updatedAt}</dd></div>
      </dl>
    </section>
    <section className="question-set-detail-tabs"><MetisTabs activeKey={activeTab} onChange={setActiveTab} items={[{ key: 'content', label: `题单内容（${record.questionCount}）`, children: contentTab }, { key: 'operations', label: '操作记录', children: operationTab }, { key: 'production', label: '生产记录', children: productionTab }]} /></section>
  </div>
}
