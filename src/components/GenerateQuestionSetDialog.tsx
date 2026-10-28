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
  const [generationMode, setGenerationMode] = useState<'workbook' | 'excel'>('workbook')
  const [scenario, setScenario] = useState<'sync' | 'topic'>('sync')
  const [importedFile, setImportedFile] = useState<File>()
  const [selectedIds, setSelectedIds] = useState<string[]>(['856418', '856419', '856420'])
  const [nameTemplate, setNameTemplate] = useState('{章节名}同步练习')
  const [syncPolicy, setSyncPolicy] = useState('merge')
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(() => chapters.filter((chapter) => selectedIds.includes(chapter.id)), [selectedIds])
  const invalidCount = selected.filter((chapter) => !chapter.eligible).length
  const pendingBindingCount = selected.filter((chapter) => chapter.mapping !== '唯一映射').length

  const close = () => {
    setStep(1)
    setImportedFile(undefined)
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
          disabled={step === 2 && (generationMode === 'workbook' ? selectedIds.length === 0 : !importedFile)}
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
      title="批量生成题单"
      open={open}
      width={920}
      footer={footer}
      onCancel={close}
    >
      <div className="wizard-steps" aria-label="生成步骤">
        {['选择方式', '准备数据', '生成配置', '预检确认'].map((label, index) => (
          <div key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''}>
            <span>{index + 1}</span>
            <b>{label}</b>
          </div>
        ))}
      </div>

      {step === 1 && (
        <section className="wizard-panel" data-sec="1">
          <div className="choice-grid generation-mode-grid">
            <button type="button" className={generationMode === 'workbook' ? 'active' : ''} onClick={() => setGenerationMode('workbook')}>
              <MetisTag color="processing">练习册</MetisTag>
              <strong>从练习册批量生成</strong>
              <p>选择练习册章节，系统读取章节题目并生成同步练习或专题题单。</p>
            </button>
            <button type="button" className={generationMode === 'excel' ? 'active' : ''} onClick={() => setGenerationMode('excel')}>
              <MetisTag color="success">Excel</MetisTag>
              <strong>通过 Excel 批量导入</strong>
              <p>按模板填写题单基本信息、题目 ID 和顺序，一次生成多份题单。</p>
            </button>
          </div>
          {generationMode === 'workbook' ? <>
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
          </> : <MetisAlert type="info" showIcon message="Excel 一行代表一道题目" description="通过题单唯一标识将多行题目聚合为题单；系统会校验题目ID、题单类型、顺序及重复数据。" />}
        </section>
      )}

      {step === 2 && (
        <section className="wizard-panel" data-sec="2">
          {generationMode === 'workbook' ? <>
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
          </> : <div className="excel-import-panel">
            <div className="wizard-panel-heading"><div><strong>上传题单 Excel</strong><p>支持 .xlsx、.xls，单次最多导入 500 份题单、20,000 道题。</p></div><MetisButton onClick={() => MetisMessage.success('题单批量导入模板已下载')}>下载模板</MetisButton></div>
            <label className={`excel-dropzone ${importedFile ? 'has-file' : ''}`}>
              <input type="file" accept=".xlsx,.xls" onChange={(event) => setImportedFile(event.target.files?.[0])} />
              <span className="excel-file-icon">XLS</span>
              <strong>{importedFile ? importedFile.name : '点击选择 Excel 文件'}</strong>
              <p>{importedFile ? `${(importedFile.size / 1024).toFixed(1)} KB · 文件已读取，下一步将进行字段校验` : '或将文件拖拽到此处上传'}</p>
            </label>
            <MetisAlert type="warning" showIcon message="必填列" description="题单唯一标识、题单名称、类型、阶段、科目、题目ID、题目顺序；专题的年级、学期和教材版本可以留空。" />
          </div>}
        </section>
      )}

      {step === 3 && (
        <section className="wizard-panel form-grid" data-sec="3">
          {generationMode === 'workbook' ? <>
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
          </> : <>
            <label className="field-stack"><span>重复题单处理</span><MetisSelect value="skip" options={[{ label: '跳过已存在题单', value: 'skip' }, { label: '覆盖草稿内容', value: 'replace' }]} /></label>
            <label className="field-stack"><span>生成后状态</span><MetisSelect value="draft" options={[{ label: '草稿', value: 'draft' }]} /></label>
            <label className="field-stack field-span-2"><span>导入文件</span><MetisInput value={importedFile?.name ?? ''} readOnly /></label>
            <MetisAlert type="info" showIcon message="导入仅创建题单草稿" description="题目ID不存在、顺序重复或必填字段缺失的数据将在预检中标记，确认前不会写入题单库。" />
          </>}
        </section>
      )}

      {step === 4 && (
        <section className="wizard-panel" data-sec="4">
          {generationMode === 'workbook' ? <>
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
          </> : <>
            <div className="precheck-summary"><div><span>Excel 数据行</span><strong>126</strong></div><div><span>识别题单</span><strong>12</strong></div><div><span>可生成</span><strong>10</strong></div><div className="danger"><span>异常题单</span><strong>2</strong></div></div>
            <MetisAlert type="warning" showIcon message="预检完成：10 份可生成，2 份需修正" description="异常数据不会生成；可先导出错误明细，修正后重新导入。" />
            <div className="precheck-list"><div><span><strong>同步练习-19.1</strong>19.1 算术平方根同步练习</span><span>26 题 · 校验通过</span></div><div><span><strong>专题-二次根式</strong>二次根式易错专项</span><span>32 题 · 校验通过</span></div><div><span><strong>同步练习-20.2</strong>分母有理化同步练习</span><span className="danger">缺少题目ID · 已阻断</span></div></div>
          </>}
        </section>
      )}
    </MetisDialog>
  )
}
