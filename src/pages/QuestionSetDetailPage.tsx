import { useEffect, useState } from 'react'
import { MetisButton, MetisEmpty, MetisInput, MetisMessage, MetisSelect, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { useNavigate, useParams } from 'react-router-dom'
import { ContentStatusTag, MethodLabel, TypeTag } from '../components/StatusTags'
import { detailQuestions } from '../data/mockData'
import type { QuestionSet } from '../features/question-sets/types'
import { questionSetRepository } from '../services/questionSetRepository'

export function QuestionSetDetailPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content')
  const [selectedQuestionId, setSelectedQuestionId] = useState(detailQuestions[0].id)

  useEffect(() => {
    setLoading(true)
    void questionSetRepository.get(id).then((item) => { setRecord(item); setLoading(false) })
  }, [id])

  if (loading) return <div className="page-container"><div className="loading-card">正在加载题单…</div></div>
  if (!record) return <div className="page-container"><div className="feedback-state"><MetisEmpty description="未找到该题单" /><MetisButton onClick={() => navigate('/assets')}>返回题单库</MetisButton></div></div>

  const questionGroups = Array.from(new Set(detailQuestions.map((item) => item.group)))
  const listContentView = <div className="question-management-view">
    <div className="question-management-layout">
      <div className="question-management-left">
        <div className="question-module-toolbar"><span>模块设置：</span><MetisSelect value="group" disabled options={[{ label: '有模块', value: 'group' }]} /></div>
        <aside className="question-order-panel"><header><strong>排序/分值</strong><div><button type="button">导出</button><button type="button" onClick={() => MetisMessage.info('打开关联题目弹窗')}>＋新建模块</button></div></header>{questionGroups.map((group) => <section key={group} className="question-order-group"><header><strong>▾　{group}</strong><button type="button" onClick={() => MetisMessage.info(`向${group}关联题目`)}>＋关联题目</button></header>{detailQuestions.filter((item) => item.group === group).map((item) => <button key={item.id} type="button" className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><span>{item.order}、{item.id}</span><MetisTag color={item.quality === 'warning' ? 'warning' : 'success'}>{item.quality === 'warning' ? '待检查' : '上线'}</MetisTag><small>0.00分</small><em>移出</em></button>)}</section>)}</aside>
      </div>
      <div className="question-management-right">
        <div className="question-management-filters"><span>题目ID：</span><MetisInput placeholder="请输入ID，多个换行分割" /><span>题目生产状态：</span><MetisSelect value="all" options={[{ label: '全部', value: 'all' }, { label: '上线', value: 'online' }]} /><MetisButton type="primary">查询</MetisButton><MetisButton>重置</MetisButton></div>
        <section className="question-card-list">{detailQuestions.map((item) => <article key={item.id} className={selectedQuestionId === item.id ? 'active' : ''} onClick={() => setSelectedQuestionId(item.id)}><header><button className="table-link table-link-title" type="button">{item.id}</button><MetisTag color="success">上线</MetisTag><strong>{item.type}</strong><span>来源：{item.origin === 'source' ? '练习册' : '人工添加'}</span><span>题目版本：{item.revision}</span></header><div className="question-card-meta"><span>出处：{item.sourceModule}</span><span>难度：{item.difficulty}</span><span>题目分层：{item.group}</span></div><div className="question-card-tags"><MetisTag>有解析</MetisTag><MetisTag>有答案</MetisTag><MetisTag>有难度</MetisTag><MetisTag>有学科题型</MetisTag></div><p><strong>{item.order}.</strong> {item.stem}</p></article>)}</section>
      </div>
    </div>
  </div>

  const contentTab = <div data-sec="3">{listContentView}</div>
  return <div className="page-container question-set-detail-page">
    <header className="question-set-detail-banner" data-sec="1"><span className="breadcrumb">内容库 / 题单库 / 题单详情</span><div className="question-set-detail-title"><h1>{record.title}</h1><ContentStatusTag value={record.contentStatus} /></div></header>
    <section className="question-set-basic-card" data-sec="2">
      <div className="question-set-basic-heading"><strong>基本信息</strong><MetisButton type="borderless" onClick={() => MetisMessage.info('编辑题单基本信息')}>编辑</MetisButton></div>
      <dl>
        <div><dt>题单ID</dt><dd>{record.id}</dd></div><div><dt>类型</dt><dd><TypeTag value={record.type} /></dd></div>
        <div><dt>题单名称</dt><dd>{record.title}</dd></div><div><dt>生产方式</dt><dd><MethodLabel value={record.method} /></dd></div>
        <div><dt>阶段 / 科目</dt><dd>{record.scope.phase} / {record.scope.subject}</dd></div><div><dt>年级 / 学期</dt><dd>{record.type === 'topic' ? '-' : `${record.scope.grade} / ${record.scope.semester ?? record.scope.volume.replace('册', '学期')}`}</dd></div>
        <div><dt>教材版本</dt><dd>{record.type === 'topic' ? '-' : record.scope.textbook}</dd></div>
        <div><dt>来源练习册</dt><dd>{record.source.workbookId ? <a className="table-link" href={`https://metis-gnosis.zhenguanyu.com/#/exercise-book/${record.source.workbookId}`} target="_blank" rel="noreferrer">{record.source.workbookName}</a> : '-'}</dd></div><div><dt>来源章节</dt><dd>{record.source.chapterPath || '-'}</dd></div>
        <div className="question-set-tags-row"><dt>标签</dt><dd>{[...record.tags, record.difficulty].filter(Boolean).map((tag) => <MetisTag key={tag}>{tag}</MetisTag>)}</dd></div>
      </dl>
    </section>
    <section className="question-set-detail-tabs"><MetisTabs activeKey={activeTab} onChange={setActiveTab} items={[{ key: 'content', label: `题目（${record.questionCount}）`, children: contentTab }]} /></section>
  </div>
}
