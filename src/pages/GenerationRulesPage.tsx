import { useState } from 'react'
import { MetisAlert, MetisButton, MetisMessage, MetisSelect, MetisTable, MetisTag } from '@yuanfudao/metis-web-component'

interface DryRunRow {
  chapter: string
  chapterId: string
  questions: number
  action: string
  mapping: string
  result: string
}

const dryRunRows: DryRunRow[] = [
  { chapter: '19.1(1) 算术平方根', chapterId: '856418', questions: 26, action: '更新 QS-10458 草稿版本', mapping: '唯一映射', result: '可执行' },
  { chapter: '19.1(2) 平方根', chapterId: '856419', questions: 24, action: '跳过：来源无变化', mapping: '唯一映射', result: '跳过' },
  { chapter: '19.1(3) 立方根', chapterId: '856420', questions: 18, action: '新建同步题单草稿', mapping: '唯一映射', result: '可执行' },
  { chapter: '19.2(1) 有理数的小数形式', chapterId: '856422', questions: 11, action: '阻断：录题生产中', mapping: '多候选', result: '阻断' },
  { chapter: '20.2(3) 分母有理化', chapterId: '856473', questions: 21, action: '新建草稿并进入待关联池', mapping: '缺少映射', result: '可执行' },
]

export function GenerationRulesPage() {
  const [dryRunVisible, setDryRunVisible] = useState(false)
  const [workbook, setWorkbook] = useState('8554')

  const dryRunColumns = [
    { title: '末级章节', key: 'chapter', render: (_: unknown, item: DryRunRow) => <div className="stacked-cell"><strong>{item.chapter}</strong><span>章节 {item.chapterId}</span></div> },
    { title: '题量', dataIndex: 'questions', key: 'questions' },
    { title: '预计动作', dataIndex: 'action', key: 'action' },
    { title: '目录映射', dataIndex: 'mapping', key: 'mapping' },
    { title: '预检结果', dataIndex: 'result', key: 'result', render: (value: string) => <MetisTag color={value === '可执行' ? 'success' : value === '阻断' ? 'error' : 'default'}>{value}</MetisTag> },
  ]

  const versionColumns = [
    { title: '版本', dataIndex: 'version', key: 'version' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (value: string) => <MetisTag color={value === '已启用' ? 'success' : 'default'}>{value}</MetisTag> },
    { title: '变更', dataIndex: 'summary', key: 'summary', width: 520 },
    { title: '生效范围', dataIndex: 'scope', key: 'scope' },
    { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt' },
    { title: '操作', key: 'action', render: () => <MetisButton type="borderless" onClick={() => MetisMessage.info('打开规则版本对比')}>对比</MetisButton> },
  ]

  const versions = [
    { version: 'v1.3', status: '已启用', summary: '新增目录唯一映射门禁；人工覆盖目标消失时转同步冲突', scope: '同步练习类练习册', updatedAt: '2026-10-20 18:00' },
    { version: 'v1.2', status: '已停用', summary: '题目按模块与源顺序聚合，发布版本固定题目版本', scope: '数学 / 物理灰度', updatedAt: '2026-10-12 10:30' },
    { version: 'v1.1', status: '已停用', summary: '首次支持一末级章节一题单和题目 ID 去重', scope: '数学灰度', updatedAt: '2026-10-01 09:00' },
  ]

  return (
    <div className="page-container rules-page">
      <header className="page-heading" data-sec="1">
        <div><span className="breadcrumb">内容库 / 题单库 / 生成规则</span><h1>题单生成规则</h1><p>规则需版本化、可试跑、可回溯；章节业务分类以显式字段为准。</p></div>
        <div className="heading-actions"><MetisButton onClick={() => setDryRunVisible(true)}>试跑规则</MetisButton><MetisButton type="primary" onClick={() => MetisMessage.info('创建规则草稿 v1.4')}>新建规则版本</MetisButton></div>
      </header>

      <section className="active-rule-card" data-sec="2">
        <div className="active-rule-header">
          <div><MetisTag color="success">已启用</MetisTag><h2>同步题单自动生成</h2><span>v1.3</span></div>
          <div><small>生效范围</small><strong>同步练习类练习册 · 全学科</strong></div>
        </div>
        <div className="rule-flow rule-flow-large">
          <div><small>01 触发事件</small><strong>练习册版本正式发布</strong><span>结构录入已完成、录题已完成</span></div><i>→</i>
          <div><small>02 资格识别</small><strong>末级章节标记“生成同步题单”</strong><span>章节上线且至少 1 道合格题</span></div><i>→</i>
          <div><small>03 聚合题目</small><strong>递归章节下全部模块</strong><span>过滤下线题；按题目 ID 去重</span></div><i>→</i>
          <div><small>04 生成草稿</small><strong>幂等新建或创建候选版本</strong><span>源基线 + 持久人工覆盖</span></div><i>→</i>
          <div><small>05 质检交付</small><strong>通过门禁后进入待审核</strong><span>一期永不自动发布</span></div>
        </div>
      </section>

      <section className="rule-config-grid" data-sec="3">
        <article><div><span>触发条件</span><MetisTag color="success">已配置</MetisTag></div><h3>版本正式发布后触发</h3><ul><li>练习册状态：上线</li><li>结构录入：已完成</li><li>录题生产：已完成</li><li>重复事件按版本与规则幂等</li></ul></article>
        <article><div><span>章节分类</span><MetisTag color="success">显式字段</MetisTag></div><h3>同步 / 专题 / 不生成</h3><ul><li>人工标记优先</li><li>名称模型仅给推荐值</li><li>分类缺失进入预检异常</li><li>非末级章节默认不生成</li></ul></article>
        <article><div><span>内容聚合</span><MetisTag color="processing">可配置</MetisTag></div><h3>按模块和源顺序聚合</h3><ul><li>模块映射为题目分组</li><li>题目 ID 去重</li><li>仅纳入审核通过且上线题</li><li>发布时固定题目版本</li></ul></article>
        <article><div><span>人工保护</span><MetisTag color="success">默认开启</MetisTag></div><h3>重算源基线，重放人工覆盖</h3><ul><li>排除题不会被自动加回</li><li>人工增题和排序继续保留</li><li>覆盖目标消失时标冲突</li><li>线上版本永不原地更新</li></ul></article>
        <article><div><span>目录映射</span><MetisTag color="warning">条件自动</MetisTag></div><h3>唯一映射才自动绑定</h3><ul><li>同步练习允许一个主节点</li><li>多候选进入待关联池</li><li>专题首期全部人工关联</li><li>绑定失败不阻断草稿生成</li></ul></article>
        <article><div><span>质量门禁</span><MetisTag color="error">发布阻断</MetisTag></div><h3>九项校验必须通过</h3><ul><li>非空、无重复、题目可用</li><li>答案解析完整</li><li>学科与教材范围一致</li><li>目录有效且版本可复现</li></ul></article>
      </section>

      <section className="dry-run-card" data-sec="4">
        <div className="section-toolbar">
          <div><strong>规则试跑</strong><span>只计算预计动作，不写入任何题单或目录。</span></div>
          <div><MetisSelect value={workbook} options={[{ label: '8554 · 一课一练普通版·八上数学', value: '8554' }]} onChange={(value) => setWorkbook(String(value))} /><MetisButton type="primary" onClick={() => setDryRunVisible(true)}>开始试跑</MetisButton></div>
        </div>
        {dryRunVisible ? (
          <>
            <div className="precheck-summary compact"><div><span>候选章节</span><strong>5</strong></div><div><span>新建</span><strong>2</strong></div><div><span>更新</span><strong>1</strong></div><div className="danger"><span>阻断</span><strong>1</strong></div></div>
            <MetisTable<DryRunRow> rowKey="chapterId" columns={dryRunColumns} dataSource={dryRunRows} pagination={false} />
          </>
        ) : <MetisAlert type="info" showIcon message="选择一份练习册试跑 v1.3" description="试跑将展示会新建、更新、跳过和阻断的章节，确认后再启用或发起任务。" />}
      </section>

      <section className="table-card" data-sec="5">
        <div className="table-toolbar"><div><strong>规则版本</strong><span>启用新版本不回写历史生成结果。</span></div></div>
        <MetisTable rowKey="version" columns={versionColumns} dataSource={versions} pagination={false} />
      </section>
    </div>
  )
}
