import { useMemo, useState } from 'react'
import {
  MetisAlert,
  MetisButton,
  MetisCheckbox,
  MetisDialog,
  MetisInput,
  MetisMessage,
  MetisSelect,
  MetisTag,
} from '@yuanfudao/metis-web-component'

interface GenerateQuestionSetDialogProps {
  open: boolean
  onClose: () => void
  onGenerated: () => void
}

interface ChapterCandidate {
  id: string
  path: string
  questions: number
  mapping: '唯一映射' | '多候选' | '缺少映射'
  eligible: boolean
}

const chapters: ChapterCandidate[] = [
  { id: '856418', path: '第19章 实数 / 19.1(1) 算术平方根', questions: 26, mapping: '唯一映射', eligible: true },
  { id: '856419', path: '第19章 实数 / 19.1(2) 平方根', questions: 24, mapping: '唯一映射', eligible: true },
  { id: '856420', path: '第19章 实数 / 19.1(3) 立方根', questions: 18, mapping: '唯一映射', eligible: true },
  { id: '856422', path: '第19章 实数 / 19.2(1) 有理数的小数形式', questions: 11, mapping: '多候选', eligible: false },
  { id: '856473', path: '第20章 二次根式 / 20.2(3) 分母有理化', questions: 21, mapping: '缺少映射', eligible: true },
]

export function GenerateQuestionSetDialog({ open, onClose, onGenerated }: GenerateQuestionSetDialogProps) {
  const [step, setStep] = useState(1)
  const [scenario, setScenario] = useState<'sync' | 'topic'>('sync')
  const [selectedIds, setSelectedIds] = useState<string[]>(['856418', '856419', '856420'])
  const [nameTemplate, setNameTemplate] = useState('{章节名}同步练习')
  const [syncPolicy, setSyncPolicy] = useState('merge')
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(() => chapters.filter((chapter) => selectedIds.includes(chapter.id)), [selectedIds])
  const invalidCount = selected.filter((chapter) => !chapter.eligible).length
  const pendingBindingCount = selected.filter((chapter) => chapter.mapping !== '唯一映射').length

  const close = () => {
    setStep(1)
    setSubmitting(false)
    onClose()
  }

  const toggleChapter = (id: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, id] : current.filter((item) => item !== id))
  }

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      MetisMessage.success('生成任务已创建：JOB-20261021-NEW')
      onGenerated()
      close()
    }, 700)
  }

  const footer = (
    <div className="dialog-footer-actions">
      <MetisButton onClick={close}>取消</MetisButton>
      {step > 1 && <MetisButton onClick={() => setStep((current) => current - 1)}>上一步</MetisButton>}
      {step < 4 ? (
        <MetisButton
          type="primary"
          disabled={step === 2 && selectedIds.length === 0}
          onClick={() => setStep((current) => current + 1)}
        >
          下一步
        </MetisButton>
      ) : (
        <MetisButton type="primary" loading={submitting} disabled={invalidCount > 0} onClick={submit}>
          创建生成任务
        </MetisButton>
      )}
    </div>
  )

  return (
    <MetisDialog
      title="从练习册生成题单"
      open={open}
      width={920}
      footer={footer}
      onCancel={close}
    >
      <div className="wizard-steps" aria-label="生成步骤">
        {['选择场景', '选择章节', '生成配置', '预检确认'].map((label, index) => (
          <div key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''}>
            <span>{index + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="wizard-panel" data-sec="1">
          <MetisAlert
            type="info"
            showIcon
            message="题单是独立资产；练习册只是来源之一"
            description="同步练习按末级章节分别生成，专题可合并多个章节生成一份题单。两种场景共用版本、审核和发布能力。"
          />
          <div className="choice-grid">
            <button type="button" className={scenario === 'sync' ? 'active' : ''} onClick={() => { setScenario('sync'); setNameTemplate('{章节名}同步练习') }}>
              <MetisTag color="processing">同步练习</MetisTag>
              <strong>一个末级章节 → 一份题单</strong>
              <p>适合跟随教材目录展示；章节映射唯一时可自动关联同步树。</p>
            </button>
            <button type="button" className={scenario === 'topic' ? 'active' : ''} onClick={() => { setScenario('topic'); setNameTemplate('二次根式化简易错专项') }}>
              <MetisTag color="purple">专题</MetisTag>
              <strong>多个章节 → 一份聚合题单</strong>
              <p>运营选择来源并预检；生成后进入专题树待关联池。</p>
            </button>
          </div>
          <label className="field-stack">
            <span>来源练习册</span>
            <MetisSelect
              value="8554"
              options={[{ label: '8554 · 一课一练普通版 2026-2027学年沪教版八上数学', value: '8554' }]}
            />
          </label>
        </section>
      )}

      {step === 2 && (
        <section className="wizard-panel" data-sec="2">
          <div className="wizard-panel-heading">
            <div><strong>选择合格的末级章节</strong><p>仅展示录题已完成且章节已上线的候选项。</p></div>
            <span>已选 {selectedIds.length} 个章节</span>
          </div>
          <div className="chapter-picker">
            {chapters.map((chapter) => (
              <label key={chapter.id} className={!chapter.eligible ? 'disabled' : ''}>
                <MetisCheckbox
                  checked={selectedIds.includes(chapter.id)}
                  disabled={!chapter.eligible}
                  onChange={(event) => toggleChapter(chapter.id, event.target.checked)}
                />
                <span className="chapter-copy">
                  <strong>{chapter.path}</strong>
                  <small>章节 {chapter.id} · {chapter.questions} 题</small>
                </span>
                <MetisTag color={chapter.mapping === '唯一映射' ? 'success' : chapter.mapping === '多候选' ? 'warning' : 'default'}>
                  {chapter.mapping}
                </MetisTag>
              </label>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="wizard-panel form-grid" data-sec="3">
          <label className="field-stack field-span-2">
            <span>{scenario === 'sync' ? '命名模板' : '题单名称'}</span>
            <MetisInput value={nameTemplate} onChange={(event) => setNameTemplate(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>上游同步策略</span>
            <MetisSelect
              value={syncPolicy}
              options={[
                { label: '人工合并（推荐）', value: 'merge' },
                { label: '条件自动跟随', value: 'follow' },
                { label: '锁定当前快照', value: 'lock' },
              ]}
              onChange={(value) => setSyncPolicy(String(value))}
            />
          </label>
          <label className="field-stack">
            <span>默认标签</span>
            <MetisInput value={scenario === 'sync' ? '课时练、系列题单' : '易错专项、培优突破'} readOnly />
          </label>
          <label className="field-stack field-span-2">
            <span>目录处理</span>
            <MetisSelect
              value={scenario === 'sync' ? 'unique' : 'pool'}
              options={scenario === 'sync'
                ? [{ label: '唯一映射自动绑定；其余进入待关联池', value: 'unique' }]
                : [{ label: '生成后进入专题树待关联池', value: 'pool' }]}
            />
          </label>
          <MetisAlert
            type="warning"
            showIcon
            message="自动生成只创建草稿"
            description="题单需通过内容质检、目录关联和人工审核后才能发布，不随练习册上线直接对外可见。"
          />
        </section>
      )}

      {step === 4 && (
        <section className="wizard-panel" data-sec="4">
          <div className="precheck-summary">
            <div><span>选中章节</span><strong>{selected.length}</strong></div>
            <div><span>将新建题单</span><strong>{scenario === 'sync' ? selected.length : selected.length ? 1 : 0}</strong></div>
            <div><span>待目录关联</span><strong>{scenario === 'sync' ? pendingBindingCount : 1}</strong></div>
            <div className={invalidCount ? 'danger' : ''}><span>阻断项</span><strong>{invalidCount}</strong></div>
          </div>
          <MetisAlert
            type={invalidCount ? 'error' : 'success'}
            showIcon
            message={invalidCount ? '预检未通过，需返回移除不合格章节' : '预检通过，可创建异步生成任务'}
            description="系统将按题目 ID 去重，保留练习册模块顺序，并记录来源章节、模块和生成规则版本。"
          />
          <div className="precheck-list">
            {selected.map((chapter) => (
              <div key={chapter.id}>
                <span><strong>{chapter.id}</strong>{chapter.path}</span>
                <span>{chapter.questions} 题 · {chapter.mapping}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </MetisDialog>
  )
}
