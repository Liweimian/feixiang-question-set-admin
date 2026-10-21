import { useMemo, useState } from 'react'
import { MetisAlert, MetisButton, MetisInput, MetisMessage, MetisSelect, MetisTable, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { catalogBindings, questionSets } from '../data/mockData'
import type { CatalogBinding, QuestionSet } from '../features/question-sets/types'

const syncNodes = [
  { id: 'chapter-19', label: '第19章 实数', level: 0, count: 11 },
  { id: 'TC-310418', label: '19.1 算术平方根', level: 1, count: 2 },
  { id: 'TC-310419', label: '19.1 平方根', level: 1, count: 1 },
  { id: 'TC-310420', label: '19.1 立方根', level: 1, count: 0 },
  { id: 'chapter-20', label: '第20章 二次根式', level: 0, count: 8 },
  { id: 'TC-320473', label: '20.2 分母有理化', level: 1, count: 0 },
]

const topicNodes = [
  { id: 'root-knowledge', label: '知识模块', level: 0, count: 56 },
  { id: 'TOPIC-2201', label: '数与式 / 二次根式', level: 1, count: 8 },
  { id: 'TOPIC-2402', label: '方程 / 一元二次方程', level: 1, count: 12 },
  { id: 'root-method', label: '难点突破', level: 0, count: 18 },
  { id: 'TOPIC-5508', label: '分母有理化', level: 1, count: 3 },
]

export function CatalogBindingPage() {
  const [treeType, setTreeType] = useState<'sync' | 'topic'>('sync')
  const [selectedNode, setSelectedNode] = useState('TC-310418')
  const [view, setView] = useState('bound')
  const [boundRows, setBoundRows] = useState(catalogBindings)

  const nodes = treeType === 'sync' ? syncNodes : topicNodes
  const currentNode = nodes.find((node) => node.id === selectedNode) ?? nodes[0]
  const bindings = boundRows.filter((binding) => binding.nodeId === selectedNode)
  const pendingSets = useMemo(
    () => questionSets.filter((item) => item.bindingStatus === 'pending' || item.bindingStatus === 'partial'),
    [],
  )

  const bindingColumns = [
    {
      title: '题单', key: 'set', width: 340,
      render: (_: unknown, item: CatalogBinding) => <div className="stacked-cell"><strong>{item.setTitle}</strong><span>{item.setId}</span></div>,
    },
    { title: '投放属性', key: 'property', render: (_: unknown, item: CatalogBinding) => <span>{item.primary ? <MetisTag color="success">主投放位</MetisTag> : <MetisTag>复用位</MetisTag>} {item.region}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <MetisTag color={value === '有效' ? 'success' : value === '待生效' ? 'warning' : 'error'}>{value}</MetisTag> },
    { title: '更新', key: 'updated', render: (_: unknown, item: CatalogBinding) => `${item.operator} · ${item.updatedAt}` },
    { title: '操作', key: 'actions', render: (_: unknown, item: CatalogBinding) => <div className="table-actions"><MetisButton type="borderless" onClick={() => MetisMessage.info(`预览 ${item.setTitle}`)}>预览</MetisButton><MetisButton type="borderless" onClick={() => setBoundRows((rows) => rows.filter((row) => row.id !== item.id))}>解绑</MetisButton></div> },
  ]

  const pendingColumns = [
    {
      title: '待关联题单', key: 'set', width: 360,
      render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.title}</strong><span>{item.id} · {item.scope.subject} · {item.scope.grade}</span></div>,
    },
    { title: '来源章节', key: 'source', render: (_: unknown, item: QuestionSet) => <div className="stacked-cell"><strong>{item.source.chapterIds.join('、') || '-'}</strong><span>{item.source.chapterPath}</span></div> },
    { title: '题量', dataIndex: 'questionCount', key: 'questionCount', width: 80 },
    { title: '建议节点', key: 'suggestion', render: (_: unknown, item: QuestionSet) => <MetisTag color={item.type === 'topic' ? 'purple' : 'processing'}>{item.type === 'topic' ? '需人工选择专题' : '教材映射待确认'}</MetisTag> },
    {
      title: '操作', key: 'actions', width: 120,
      render: (_: unknown, item: QuestionSet) => (
        <MetisButton
          type="primary"
          onClick={() => {
            const next: CatalogBinding = { id: `BIND-${Date.now()}`, treeType: treeType === 'sync' ? '同步练习树' : '专题树', nodePath: currentNode.label, nodeId: currentNode.id, setTitle: item.title, setId: item.id, primary: true, region: '全国', status: '待生效', operator: '王晓慧', updatedAt: '刚刚' }
            setBoundRows((rows) => [...rows, next])
            setView('bound')
            MetisMessage.success(`已将 ${item.id} 关联到 ${currentNode.label}`)
          }}
        >
          关联到此节点
        </MetisButton>
      ),
    },
  ]

  return (
    <div className="page-container binding-page">
      <header className="page-heading" data-sec="1">
        <div><span className="breadcrumb">内容生产 / 题单管理</span><h1>目录关联工作台</h1><p>同步树和专题树只负责题单投放、排序和前台可见范围，不复制树本身的管理能力。</p></div>
        <MetisButton onClick={() => MetisMessage.info('打开前台题库预览')}>预览前台题库</MetisButton>
      </header>

      <section className="binding-filters" data-sec="2">
        <MetisTabs
          activeKey={treeType}
          items={[{ key: 'sync', label: '同步练习树' }, { key: 'topic', label: '专题树' }]}
          onChange={(key) => { const next = key as 'sync' | 'topic'; setTreeType(next); setSelectedNode(next === 'sync' ? 'TC-310418' : 'TOPIC-2201') }}
        />
        <div><MetisSelect value="math8" options={[{ label: '初中 · 数学 · 八年级', value: 'math8' }]} /><MetisSelect value={treeType === 'sync' ? 'hj8' : 'all'} options={[{ label: treeType === 'sync' ? '沪教版(五四制) · 八上' : '全部专题分类', value: treeType === 'sync' ? 'hj8' : 'all' }]} /><MetisInput placeholder="搜索目录节点" /></div>
      </section>

      <section className="binding-workbench" data-sec="3">
        <aside className="catalog-tree" aria-label={treeType === 'sync' ? '同步练习目录' : '专题目录'}>
          <div className="catalog-tree-title"><strong>{treeType === 'sync' ? '教材章节' : '专题分类'}</strong><span>{nodes.length} 个节点</span></div>
          {nodes.map((node) => (
            <button key={node.id} type="button" className={`${selectedNode === node.id ? 'active' : ''} level-${node.level}`} onClick={() => setSelectedNode(node.id)}>
              <span>{node.label}</span><small>{node.count}</small>
            </button>
          ))}
        </aside>

        <div className="binding-content">
          <div className="node-heading">
            <div><span>当前目录节点</span><h2>{currentNode.label}</h2><p>节点 {currentNode.id} · 已关联 {bindings.length} 份题单</p></div>
            <MetisButton type="primary" onClick={() => setView('pending')}>从待关联池选择</MetisButton>
          </div>
          <MetisAlert type="info" showIcon message="前台可见 = 有效目录关联 + 已上线题单版本" description="题单已生成或目录已关联，都不代表已经对用户可见。" />
          <MetisTabs
            activeKey={view}
            items={[{ key: 'bound', label: `已关联题单（${bindings.length}）` }, { key: 'pending', label: `待关联池（${pendingSets.length}）` }]}
            onChange={setView}
          />
          {view === 'bound'
            ? <MetisTable<CatalogBinding> rowKey="id" columns={bindingColumns} dataSource={bindings} pagination={false} />
            : <MetisTable<QuestionSet> rowKey="id" columns={pendingColumns} dataSource={pendingSets} pagination={{ pageSize: 6 }} />}
        </div>
      </section>
    </div>
  )
}
