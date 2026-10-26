import { useEffect, useMemo, useState } from 'react'
import {
  MetisAlert,
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
  const [boundRows, setBoundRows] = useState(catalogBindings)

  useEffect(() => {
    setSelectedNode(isTextbook ? 'TC-310418' : 'TOPIC-2201')
    setRelationTab(isTextbook ? 'knowledge' : 'questionSet')
    setQuestionSetView('bound')
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

  const bindingColumns = [
    { title: '题单ID / 名称', key: 'set', width: 340, render: (_: unknown, item: CatalogBinding) => <div className="stacked-cell"><strong>{item.setTitle}</strong><span>{item.setId}</span></div> },
    { title: '投放属性', key: 'property', width: 190, render: (_: unknown, item: CatalogBinding) => <span>{item.primary ? <MetisTag color="success">主投放位</MetisTag> : <MetisTag>复用位</MetisTag>} {item.region}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (value: string) => <MetisTag color={value === '有效' ? 'success' : value === '待生效' ? 'warning' : 'error'}>{value}</MetisTag> },
    { title: '更新人 / 时间', key: 'updated', render: (_: unknown, item: CatalogBinding) => `${item.operator} · ${item.updatedAt}` },
    { title: '操作', key: 'actions', width: 130, render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => MetisMessage.info(`预览 ${item.setTitle}`)}>预览</MetisButton><MetisButton type="borderless" onClick={() => setBoundRows((rows) => rows.filter((row) => row.id !== item.id))}>解绑</MetisButton></div> },
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

  return (
    <div className="page-container catalog-management-page">
      <header className="page-heading" data-sec="1">
        <div><span className="breadcrumb">内容库 / {isTextbook ? '教材目录' : '专题树'}</span><h1>{isTextbook ? '教材目录' : '专题树'}</h1><p>{isTextbook ? '维护同步练习使用的教材章节目录，并集中管理节点关联资源。' : '维护专题分类与层级，并将专题题单投放到对应节点。'}</p></div>
        <div className="heading-actions"><MetisButton onClick={() => MetisMessage.info('打开目录排序')}>排序</MetisButton><MetisButton type="primary" onClick={() => MetisMessage.info(isTextbook ? '新建教材' : '新建专题节点')}>{isTextbook ? '新建教材' : '新建专题节点'}</MetisButton></div>
      </header>

      <section className="catalog-filter-card" data-sec="2">
        <MetisSelect value={isTextbook ? 'middle-math' : 'middle-math-topic'} options={[{ label: '初中 / 数学', value: isTextbook ? 'middle-math' : 'middle-math-topic' }]} />
        <MetisSelect value={isTextbook ? 'hj-2024' : 'all-topic'} options={[{ label: isTextbook ? '沪教版(五四制)(2024)' : '全部专题分类', value: isTextbook ? 'hj-2024' : 'all-topic' }]} />
        <MetisSelect value="online" options={[{ label: '全部状态', value: 'all' }, { label: '上线', value: 'online' }, { label: '下线', value: 'offline' }]} />
        <MetisInput placeholder={isTextbook ? '搜索教材、章节名称或ID' : '搜索专题节点名称或ID'} />
        <MetisButton>搜索</MetisButton>
      </section>

      <section className="catalog-management-workbench" data-sec="3">
        <aside className="catalog-tree-panel" aria-label={isTextbook ? '教材目录树' : '专题树'}>
          <div className="catalog-tree-title"><div><strong>{isTextbook ? '教材章节' : '专题分类'}</strong><span>{nodes.length} 个节点</span></div><MetisButton type="borderless">全部展开</MetisButton></div>
          <div className="catalog-node-list">
            {nodes.map((node) => <button key={node.id} type="button" className={`${selectedNode === node.id ? 'active' : ''} level-${node.level}`} onClick={() => setSelectedNode(node.id)}><span>{node.label}</span><span className="node-meta">{node.status && <MetisTag color={node.status === '上线' ? 'success' : 'default'}>{node.status}</MetisTag>}<small>{node.relationCount}</small></span></button>)}
          </div>
        </aside>

        <div className="catalog-relation-content">
          <div className="directory-node-heading">
            <div><span>{isTextbook ? '[章节]' : '[专题节点]'}</span><h2>{currentNode.label}</h2><p>节点 ID：{currentNode.id} · {isTextbook ? `当前共 ${currentNode.relationCount} 项关联` : `当前已关联 ${bindings.length} 个题单`}</p></div>
            <div><MetisButton onClick={() => MetisMessage.info('编辑当前节点')}>编辑节点</MetisButton><MetisButton type="primary" onClick={() => MetisMessage.info(`打开关联${relationLabel}选择器`)}>关联{relationLabel}</MetisButton></div>
          </div>

          {isTextbook ? <MetisTabs activeKey={relationTab} items={textbookRelationItems} onChange={(key) => setRelationTab(key as RelationTab)} /> : <div className="topic-relation-heading"><strong>关联题单</strong><span>专题节点只关联题单，不直接关联知识点、试卷或题目</span></div>}

          {relationTab === 'questionSet' ? <div className="relation-panel">
            <MetisAlert type="info" showIcon message="前台可见 = 有效目录关联 + 已上线题单版本" description={isTextbook ? '教材目录用于同步练习投放；题单生成后仍需在此确认关联关系。' : '专题树只负责专题题单的分类与投放，不承载题单内容。'} />
            <div className="relation-subtabs"><MetisTabs activeKey={questionSetView} items={[{ key: 'bound', label: `已关联（${bindings.length}）` }, { key: 'pending', label: `待关联池（${pendingSets.length}）` }]} onChange={(key) => setQuestionSetView(key as 'bound' | 'pending')} /></div>
            {questionSetView === 'bound' ? <MetisTable<CatalogBinding> rowKey="id" columns={bindingColumns} dataSource={bindings} pagination={false} /> : <MetisTable<QuestionSet> rowKey="id" columns={pendingColumns} dataSource={pendingSets} pagination={{ pageSize: 6 }} />}
          </div> : <div className="relation-panel">
            <div className="relation-toolbar"><div><strong>已关联{relationLabel}</strong><span>关联关系仅作用于当前目录节点</span></div><div><MetisInput placeholder={`按${relationLabel}名称或ID搜索`} /><MetisButton>搜索</MetisButton></div></div>
            <MetisTable<RelatedResource> rowKey="id" columns={resourceColumns} dataSource={resourcesByTab[relationTab]} pagination={false} />
          </div>}
        </div>
      </section>
    </div>
  )
}
