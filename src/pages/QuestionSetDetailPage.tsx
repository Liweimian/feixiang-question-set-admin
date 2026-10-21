import { useEffect, useMemo, useState } from 'react'
import {
  MetisAlert,
  MetisButton,
  MetisEmpty,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTable,
  MetisTabs,
  MetisTag,
} from '@yuanfudao/metis-web-component'
import { useNavigate, useParams } from 'react-router-dom'
import { BindingStatusTag, ContentStatusTag, SyncStatusTag, TypeTag } from '../components/StatusTags'
import { catalogBindings, detailQuestions, versions } from '../data/mockData'
import type { QuestionItem, QuestionSet, VersionRecord } from '../features/question-sets/types'
import { questionSetRepository } from '../services/questionSetRepository'

export function QuestionSetDetailPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState(detailQuestions)
  const [diffHandled, setDiffHandled] = useState(false)
  const [activeTab, setActiveTab] = useState('questions')

  useEffect(() => {
    setLoading(true)
    void questionSetRepository.get(id).then((item) => {
      setRecord(item)
      setLoading(false)
    })
  }, [id])

  const questionColumns = useMemo(() => [
    { title: '序号', dataIndex: 'order', key: 'order', width: 64 },
    {
      title: '题目', key: 'stem', width: 450,
      render: (_: unknown, item: QuestionItem) => (
        <div className="question-title-cell">
          <div><button type="button">{item.id}</button><MetisTag color={item.origin === 'manual' ? 'purple' : 'default'}>{item.origin === 'manual' ? '人工新增' : '来自上游'}</MetisTag></div>
          <p>{item.stem}</p>
          <span>{item.group} · {item.sourceModule} · 固定题目版本 {item.revision}</span>
        </div>
      ),
    },
    { title: '题型', dataIndex: 'type', key: 'type', width: 100 },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 90 },
    {
      title: '质检', dataIndex: 'quality', key: 'quality', width: 100,
      render: (value: QuestionItem['quality']) => <MetisTag color={value === 'passed' ? 'success' : value === 'warning' ? 'warning' : 'error'}>{value === 'passed' ? '通过' : value === 'warning' ? '需关注' : '阻断'}</MetisTag>,
    },
    {
      title: '操作', key: 'action', width: 180,
      render: (_: unknown, item: QuestionItem) => (
        <div className="table-actions">
          <MetisButton type="borderless" disabled={item.order === 1} onClick={() => moveQuestion(item.id, -1)}>上移</MetisButton>
          <MetisButton type="borderless" onClick={() => moveQuestion(item.id, 1)}>下移</MetisButton>
          <MetisButton type="borderless" onClick={() => removeQuestion(item.id)}>移除</MetisButton>
        </div>
      ),
    },
  ], [questions])

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

  const removeQuestion = (questionId: string) => {
    setQuestions((current) => current.filter((item) => item.id !== questionId).map((item, index) => ({ ...item, order: index + 1 })))
    MetisMessage.success('已记录人工排除；后续同步不会自动恢复该题')
  }

  const mergeSourceDiff = () => {
    setDiffHandled(true)
    setQuestions((current) => [
      ...current,
      { id: '90661208', revision: 'R1', order: current.length + 1, group: '三、解答题', stem: '根据算术平方根的定义完成探究并说明理由。', type: '解答题', difficulty: '中等', sourceModule: '模块1686169', origin: 'source', quality: 'passed' },
    ])
    MetisMessage.success('已将可安全合并的上游变化应用到 V4 草稿')
  }

  if (loading) return <div className="page-container"><div className="loading-card">正在加载题单…</div></div>
  if (!record) return <div className="page-container"><div className="feedback-state"><MetisEmpty description="未找到该题单" /><MetisButton onClick={() => navigate('/assets')}>返回题单库</MetisButton></div></div>

  const bindings = catalogBindings.filter((binding) => binding.setId === record.id)

  const questionTab = (
    <div className="editor-layout" data-sec="3">
      <div className="editor-main">
        {record.diff && !diffHandled && (
          <MetisAlert
            type="warning"
            showIcon
            message={`检测到上游变化：新增 ${record.diff.added}、移除 ${record.diff.removed}、内容变更 ${record.diff.updated}`}
            description="系统已保留人工增删与排序。请查看差异后选择性合并；当前线上 V3 不受影响。"
            action={<MetisButton type="primary" onClick={mergeSourceDiff}>查看并合并</MetisButton>}
          />
        )}
        <div className="section-toolbar">
          <div><strong>V4 草稿 · 题目编排</strong><span>{questions.length} 题，预计 24 分钟</span></div>
          <div><MetisButton onClick={() => MetisMessage.info('打开全局题库选题器')}>添加题目</MetisButton><MetisButton onClick={() => MetisMessage.info('打开重复题检测结果')}>重新质检</MetisButton></div>
        </div>
        <MetisTable<QuestionItem> rowKey="id" columns={questionColumns} dataSource={questions} pagination={false} />
      </div>
      <aside className="quality-panel">
        <h3>实时质检</h3>
        <div className="quality-score"><strong>92</strong><span>可提交审核</span></div>
        <dl>
          <div><dt>题型结构</dt><dd>选择 50% · 填空 33% · 解答 17%</dd></div>
          <div><dt>难度分布</dt><dd>容易 33% · 较易 50% · 中等 17%</dd></div>
          <div><dt>来源题</dt><dd>{questions.filter((item) => item.origin === 'source').length} 题</dd></div>
          <div><dt>人工调整</dt><dd>{questions.filter((item) => item.origin === 'manual').length} 题</dd></div>
        </dl>
        <div className="quality-checks"><span className="pass">已通过 8 项</span><span className="warning">需关注 1 项</span><span>阻断 0 项</span></div>
        <p>第 3 题解析仅为“略”，建议发布前补充完整解析。</p>
      </aside>
    </div>
  )

  const sourceTab = (
    <div className="detail-section" data-sec="4">
      <MetisAlert type="info" showIcon message="来源关系只负责血缘和同步，不限制题单的后续运营" description="解除来源不会删除题单；已发布版本仍保持可复现。" />
      <div className="source-card">
        <div className="source-card-header"><div><MetisTag color="processing">主要来源</MetisTag><strong>练习册 {record.source.workbookId}</strong></div><SyncStatusTag value={record.syncStatus} /></div>
        <h3>{record.source.workbookName}</h3>
        <p>{record.source.chapterPath}</p>
        <div className="source-facts">
          <span>章节 ID：{record.source.chapterIds.join('、') || '-'}</span>
          <span>来源快照：{record.source.sourceVersion || '-'}</span>
          <span>规则：{record.source.ruleVersion || '-'}</span>
          <span>同步策略：人工合并</span>
        </div>
        <div className="source-card-actions"><MetisButton onClick={() => MetisMessage.info('跳转练习册详情')}>查看来源章节</MetisButton><MetisButton onClick={() => MetisMessage.info('打开来源差异')}>查看差异</MetisButton></div>
      </div>
    </div>
  )

  const bindingTab = (
    <div className="detail-section" data-sec="5">
      <div className="section-toolbar"><div><strong>目录投放</strong><span>目录节点只保存题单引用和排序，不承载内容。</span></div><MetisButton type="primary" onClick={() => MetisMessage.info('打开目录节点选择器')}>关联目录</MetisButton></div>
      {bindings.length ? (
        <div className="binding-list">
          {bindings.map((binding) => (
            <div key={binding.id}>
              <span><MetisTag color={binding.treeType === '同步练习树' ? 'processing' : 'purple'}>{binding.treeType}</MetisTag>{binding.primary && <MetisTag color="success">主投放位</MetisTag>}</span>
              <strong>{binding.nodePath}</strong>
              <small>节点 {binding.nodeId} · {binding.region} · {binding.status}</small>
              <MetisButton type="borderless" onClick={() => MetisMessage.info('预览前台位置')}>前台预览</MetisButton>
            </div>
          ))}
        </div>
      ) : <MetisEmpty description="尚未关联前台目录" />}
    </div>
  )

  const versionColumns = [
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <MetisTag color={value === '当前线上' ? 'success' : value.includes('草稿') ? 'processing' : 'default'}>{value}</MetisTag> },
    { title: '来源快照', dataIndex: 'sourceSnapshot', key: 'sourceSnapshot' },
    { title: '变更摘要', dataIndex: 'summary', key: 'summary', width: 360 },
    { title: '题量', dataIndex: 'questionCount', key: 'questionCount' },
    { title: '创建', key: 'created', render: (_: unknown, item: VersionRecord) => `${item.creator} · ${item.createdAt}` },
    { title: '发布时间', dataIndex: 'publishedAt', key: 'publishedAt', render: (value?: string) => value ?? '-' },
    { title: '操作', key: 'action', render: () => <MetisButton type="borderless" onClick={() => MetisMessage.info('打开版本对比')}>版本对比</MetisButton> },
  ]

  const versionTab = <div className="detail-section" data-sec="6"><MetisTable<VersionRecord> rowKey="version" columns={versionColumns} dataSource={versions} pagination={false} /></div>

  const logTab = (
    <div className="detail-section" data-sec="7">
      <div className="audit-list">
        <div><time>2026-10-21 17:46</time><strong>系统检测到来源变化</strong><p>章节 856418 新增 3 题、移除 1 题，创建 V4 草稿；线上 V3 保持不变。</p></div>
        <div><time>2026-10-20 16:08</time><strong>王晓慧调整题目</strong><p>人工新增题目 90551021；排除 1 道重复题。原因：补齐基础计算。</p></div>
        <div><time>2026-10-14 10:00</time><strong>赵琪发布 V3</strong><p>关联同步练习树节点 TC-310418，并将 V3 切换为线上版本。</p></div>
      </div>
    </div>
  )

  return (
    <div className="page-container detail-page">
      <header className="detail-heading" data-sec="1">
        <button className="back-link" type="button" onClick={() => navigate('/assets')}>返回题单库</button>
        <div className="detail-title-row">
          <div>
            <div className="detail-title-tags"><TypeTag value={record.type} /><ContentStatusTag value={record.contentStatus} /><SyncStatusTag value={record.syncStatus} /><BindingStatusTag value={record.bindingStatus} /></div>
            <h1>{record.title}</h1>
            <p>{record.id} · 线上 {record.onlineVersion ?? '无'} · 草稿 {record.draftVersion ?? '无'} · 负责人 {record.owner}</p>
          </div>
          <div className="heading-actions"><MetisButton onClick={() => MetisMessage.success('草稿已保存')}>保存草稿</MetisButton><MetisButton type="primary" onClick={() => MetisMessage.success('已提交审核')}>提交审核</MetisButton></div>
        </div>
      </header>

      <section className="info-card" data-sec="2">
        <div className="editable-summary">
          <label><span>前台名称</span><MetisInput value={record.title} readOnly /></label>
          <label><span>综合难度</span><MetisSelect value={record.difficulty} options={[{ label: '基础', value: '基础' }, { label: '较易', value: '较易' }, { label: '中等', value: '中等' }, { label: '较难', value: '较难' }]} /></label>
          <label><span>同步策略</span><MetisSelect value={record.syncPolicy} options={[{ label: '人工合并（推荐）', value: 'merge' }, { label: '条件自动跟随', value: 'follow' }, { label: '锁定当前快照', value: 'lock' }]} /></label>
        </div>
        <div className="summary-facts">
          <span><small>教学范围</small>{record.scope.subject} · {record.scope.grade} · {record.scope.textbook}</span>
          <span><small>内容规模</small>{record.questionCount} 题 · {record.duration} 分钟</span>
          <span><small>来源章节</small>{record.source.chapterIds.join('、') || '纯人工题单'}</span>
          <span><small>标签</small>{record.tags.join(' / ')}</span>
        </div>
      </section>

      <section className="detail-tabs-card">
        <MetisTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            { key: 'questions', label: '题目编排', children: questionTab },
            { key: 'source', label: '来源映射', children: sourceTab },
            { key: 'binding', label: '目录投放', children: bindingTab },
            { key: 'versions', label: '版本记录', children: versionTab },
            { key: 'logs', label: '操作记录', children: logTab },
          ]}
        />
      </section>
    </div>
  )
}
