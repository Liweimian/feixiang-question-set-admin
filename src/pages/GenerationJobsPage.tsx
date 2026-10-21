import { useMemo, useState } from 'react'
import { MetisAlert, MetisButton, MetisMessage, MetisSelect, MetisTable, MetisTag } from '@yuanfudao/metis-web-component'
import { GenerateQuestionSetDialog } from '../components/GenerateQuestionSetDialog'
import { generationJobs } from '../data/mockData'
import type { GenerationJob } from '../features/question-sets/types'

export function GenerationJobsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>()
  const [jobs, setJobs] = useState(generationJobs)

  const visibleJobs = useMemo(
    () => statusFilter ? jobs.filter((job) => job.status === statusFilter) : jobs,
    [jobs, statusFilter],
  )

  const columns = [
    {
      title: '任务', key: 'task', width: 280,
      render: (_: unknown, item: GenerationJob) => (
        <div className="stacked-cell"><strong>{item.id}</strong><span>{item.trigger} · {item.initiator}</span></div>
      ),
    },
    {
      title: '来源练习册', key: 'workbook', width: 260,
      render: (_: unknown, item: GenerationJob) => <div className="stacked-cell"><strong>{item.workbook}</strong><span>练习册 {item.workbookId} · 规则 {item.ruleVersion}</span></div>,
    },
    { title: '符合章节', dataIndex: 'eligible', key: 'eligible', width: 90 },
    {
      title: '执行结果', key: 'result', width: 260,
      render: (_: unknown, item: GenerationJob) => (
        <div className="job-result-row">
          <span className="success">新建 {item.created}</span><span>更新 {item.updated}</span><span>跳过 {item.skipped}</span><span className={item.conflict ? 'warning' : ''}>冲突 {item.conflict}</span><span className={item.failed ? 'danger' : ''}>失败 {item.failed}</span>
        </div>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 110,
      render: (value: GenerationJob['status']) => {
        const labels = { running: '执行中', success: '成功', partial: '部分成功', failed: '失败' }
        return <MetisTag color={value === 'success' ? 'success' : value === 'partial' ? 'warning' : value === 'failed' ? 'error' : 'processing'}>{labels[value]}</MetisTag>
      },
    },
    {
      title: '时间', key: 'time', width: 180,
      render: (_: unknown, item: GenerationJob) => <div className="stacked-cell"><strong>{item.startedAt}</strong><span>耗时 {item.duration}</span></div>,
    },
    {
      title: '操作', key: 'actions', width: 170,
      render: (_: unknown, item: GenerationJob) => (
        <div className="table-actions">
          <MetisButton type="borderless" onClick={() => MetisMessage.info(`查看 ${item.id} 的章节级明细`)}>详情</MetisButton>
          <MetisButton
            type="borderless"
            disabled={!item.failed && !item.conflict}
            onClick={() => {
              setJobs((current) => current.map((job) => job.id === item.id ? { ...job, failed: 0, conflict: 0, status: 'success' } : job))
              MetisMessage.success('失败与冲突项已进入重试队列')
            }}
          >
            重试异常项
          </MetisButton>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container jobs-page">
      <header className="page-heading" data-sec="1">
        <div><span className="breadcrumb">内容生产 / 题单管理</span><h1>生成任务</h1><p>每次自动或人工生成都先预检、可追踪、可幂等重试。</p></div>
        <MetisButton type="primary" data-track="/click/generationJobs/create | 创建人工生成任务 | 无" onClick={() => setDialogOpen(true)}>人工批量生成</MetisButton>
      </header>

      <section className="rule-summary-card" data-sec="2">
        <div className="rule-summary-title"><div><MetisTag color="success">已启用</MetisTag><strong>同步题单自动生成 · v1.3</strong></div><MetisButton type="borderless" onClick={() => MetisMessage.info('跳转生成规则')}>查看规则</MetisButton></div>
        <div className="rule-flow">
          <div><small>触发</small><strong>练习册版本正式发布</strong><span>且结构录入、录题均完成</span></div>
          <i>→</i>
          <div><small>识别</small><strong>显式标记的末级章节</strong><span>不依赖章节名称猜测</span></div>
          <i>→</i>
          <div><small>生成</small><strong>一章节一题单草稿</strong><span>按题目 ID 去重、保留模块顺序</span></div>
          <i>→</i>
          <div><small>交付</small><strong>质检 + 待审核</strong><span>唯一映射才自动关联目录</span></div>
        </div>
      </section>

      <section className="metric-grid job-metrics" data-sec="3">
        <div><span>今日任务</span><strong>36</strong><small>自动 31 · 人工 5</small></div>
        <div><span>生成成功率</span><strong>97.8%</strong><small>较昨日 +0.6%</small></div>
        <div><span>待人工处理</span><strong>8</strong><small>冲突 3 · 缺映射 5</small></div>
        <div><span>平均耗时</span><strong>3分12秒</strong><small>每本练习册</small></div>
      </section>

      <section className="table-card" data-sec="4">
        <div className="table-toolbar">
          <div><strong>任务记录</strong><span>成功行重试时会按幂等键自动跳过</span></div>
          <MetisSelect
            allowClear
            value={statusFilter}
            placeholder="全部任务状态"
            options={[{ label: '成功', value: 'success' }, { label: '部分成功', value: 'partial' }, { label: '失败', value: 'failed' }, { label: '执行中', value: 'running' }]}
            onChange={(value) => setStatusFilter(value ? String(value) : undefined)}
          />
        </div>
        <MetisTable<GenerationJob> rowKey="id" columns={columns} dataSource={visibleJobs} pagination={{ pageSize: 8 }} />
      </section>

      <section className="page-alert" data-sec="5">
        <MetisAlert type="warning" showIcon message="部分成功不是失败" description="允许只重试失败或冲突章节；已成功章节按幂等键跳过，避免重复生成题单。" />
      </section>

      <GenerateQuestionSetDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onGenerated={() => setJobs((current) => [{ ...generationJobs[0], id: 'JOB-20261021-NEW', workbook: '一课一练普通版·八上数学', created: 3, eligible: 3, status: 'success', initiator: '王晓慧', startedAt: '刚刚', duration: '18秒' }, ...current])} />
    </div>
  )
}
