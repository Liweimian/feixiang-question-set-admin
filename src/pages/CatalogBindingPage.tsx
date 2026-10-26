import { useEffect, useMemo, useState } from 'react'
import {
  MetisButton,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTable,
  MetisTabs,
  MetisTag,
} from '@yuanfudao/metis-web-component'
import { catalogBindings, questionSets } from '../data/mockData'
import type { CatalogBinding, QuestionSet } from '../features/question-sets/types'

interface CatalogBindingPageProps {
  mode: 'textbook' | 'topic'
}

type RelationTab = 'knowledge' | 'paper' | 'questionSet' | 'question'

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
  const isTextbook = mode === 'textbook'
  const nodes = isTextbook ? textbookNodes : topicNodes
  const [selectedNode, setSelectedNode] = useState(isTextbook ? 'TC-310418' : 'TOPIC-2201')
  const [relationTab, setRelationTab] = useState<RelationTab>(isTextbook ? 'knowledge' : 'questionSet')
  const [questionSetView, setQuestionSetView] = useState<'bound' | 'pending'>('bound')
  const [topicPanel, setTopicPanel] = useState<'sets' | 'history'>('sets')
  const [boundRows, setBoundRows] = useState(catalogBindings)

  useEffect(() => {
    setSelectedNode(isTextbook ? 'TC-310418' : 'TOPIC-2201')
    setRelationTab(isTextbook ? 'knowledge' : 'questionSet')
    setQuestionSetView('bound')
    setTopicPanel('sets')
  }, [isTextbook])

  const currentNode = nodes.find((node) => node.id === selectedNode) ?? nodes[0]
  const expectedTreeType = isTextbook ? '同步练习树' : '专题树'
  const bindings = boundRows.filter((binding) => binding.treeType === expectedTreeType && binding.nodeId === selectedNode)
  const pendingSets = useMemo(() => questionSets.filter((item) => item.bindingStatus === 'pending' || item.bindingStatus === 'partial'), [])

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
    { title: '题单ID', dataIndex: 'setId', key: 'setId', width: 180 },
    { title: '题单名称', dataIndex: 'setTitle', key: 'setTitle', render: (value: string) => <strong>{value}</strong> },
    { title: '题单类型', key: 'type', width: 160, render: () => <MetisTag color="processing">同步练习</MetisTag> },
    { title: '题单状态', dataIndex: 'status', key: 'status', width: 140, render: (value: string) => <MetisTag color={value === '有效' ? 'success' : 'warning'}>{value === '有效' ? '已上线' : value}</MetisTag> },
    { title: '操作', key: 'actions', width: 180, render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => MetisMessage.info(`查看 ${item.setTitle}`)}>查看</MetisButton><MetisButton type="borderless" onClick={() => setBoundRows((rows) => rows.filter((row) => row.id !== item.id))}>解除关联</MetisButton></div> },
  ]

  const pendingColumns = [
    { title: '待关联题单', key: 'set', width: 360, render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.title}</strong><span>{item.id} · {item.scope.subject} · {item.scope.grade}</span></div> },
    { title: '来源章节', key: 'source', render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.source.chapterIds.join('、') || '-'}</strong><span>{item.source.chapterPath}</span></div> },
    { title: '题量', dataIndex: 'questionCount', key: 'questionCount', width: 80 },
    { title: '建议', key: 'suggestion', width: 170, render: (_: unknown, item: QuestionSet) => <MetisTag color={item.type === 'topic' ? 'purple' : 'processing'}>{item.type === 'topic' ? '建议关联专题树' : '建议关联教材目录'}</MetisTag> },
    {
      title: '操作', key: 'actions', width: 130,
      render: (_: unknown, item: QuestionSet) => <MetisButton type="primary" onClick={() => {
        const next: CatalogBinding = { id: `BIND-${Date.now()}`, treeType: expectedTreeType, nodePath: currentNode.label, nodeId: currentNode.id, setTitle: item.title, setId: item.id, primary: true, region: '全国', status: '待生效', operator: '王晓慧', updatedAt: '刚刚' }
        setBoundRows((rows) => [...rows, next])
        setQuestionSetView('bound')
        MetisMessage.success(`已将 ${item.id} 关联到 ${currentNode.label}`)
      }}>关联到此节点</MetisButton>,
    },
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

  if (!isTextbook) {
    const topicBindingColumns = [
      { title: '题单ID / 名称', key: 'set', width: 360, render: (_: unknown, item: CatalogBinding) => <div className="stacked-cell"><strong>{item.setTitle}</strong><span>{item.setId}</span></div> },
      { title: '题单类型', key: 'type', width: 120, render: () => <MetisTag color="purple">专题</MetisTag> },
      { title: '题量', key: 'count', width: 90, render: (_: unknown, item: CatalogBinding) => questionSets.find((set) => set.id === item.setId)?.questionCount ?? 18 },
      { title: '来源', key: 'source', render: (_: unknown, item: CatalogBinding) => questionSets.find((set) => set.id === item.setId)?.source.chapterPath ?? '人工组题' },
      { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <MetisTag color={value === '有效' ? 'success' : 'warning'}>{value}</MetisTag> },
      { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 150 },
      { title: '操作', key: 'actions', width: 150, render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => MetisMessage.info(`预览 ${item.setTitle}`)}>查看</MetisButton><MetisButton type="borderless" onClick={() => setBoundRows((rows) => rows.filter((row) => row.id !== item.id))}>移除</MetisButton></div> },
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
                  <MetisButton type="borderless" onClick={() => setQuestionSetView('pending')}>＋ 关联题单</MetisButton>
                </div>
                {questionSetView === 'pending' ? <div className="topic-pending-panel"><div className="relation-toolbar"><div><strong>待关联题单</strong><span>选择题单后关联至「{currentNode.label}」</span></div><MetisButton type="borderless" onClick={() => setQuestionSetView('bound')}>返回已关联</MetisButton></div><MetisTable<QuestionSet> rowKey="id" columns={pendingColumns} dataSource={pendingSets} pagination={{ pageSize: 6 }} /></div> : <MetisTable<CatalogBinding> rowKey="id" columns={topicBindingColumns} dataSource={bindings} pagination={{ pageSize: 10 }} />}
              </> : <MetisTable rowKey="id" columns={topicHistoryColumns} dataSource={topicHistory} pagination={false} />}
            </section>
          </div>
        </section>
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
            <div className="textbook-question-set-heading"><h3>关联题单</h3><MetisButton type="borderless" onClick={() => setQuestionSetView('pending')}>＋ 关联题单</MetisButton></div>
            {questionSetView === 'pending' ? <div className="topic-pending-panel"><div className="relation-toolbar"><div><strong>选择题单</strong><span>选择后关联到当前教材章节</span></div><MetisButton type="borderless" onClick={() => setQuestionSetView('bound')}>返回关联列表</MetisButton></div><MetisTable<QuestionSet> rowKey="id" columns={pendingColumns} dataSource={pendingSets} pagination={{ pageSize: 6 }} /></div> : <MetisTable<CatalogBinding> rowKey="id" columns={textbookQuestionSetColumns} dataSource={bindings} pagination={false} />}
          </div> : <div className="relation-panel">
            <div className="relation-toolbar"><div><strong>已关联{relationLabel}</strong><span>关联关系仅作用于当前目录节点</span></div><div><MetisInput placeholder={`按${relationLabel}名称或ID搜索`} /><MetisButton>搜索</MetisButton></div></div>
            <MetisTable<RelatedResource> rowKey="id" columns={resourceColumns} dataSource={resourcesByTab[relationTab]} pagination={false} />
          </div>}
          </section>
        </div>
      </section>
    </div>
  )
}
