import { useState } from 'react'
import { MetisAlert, MetisButton, MetisDialog, MetisInput, MetisMessage, MetisSelect } from '@yuanfudao/metis-web-component'

interface GenerateQuestionSetDialogProps {
  open: boolean
  onClose: () => void
  onGenerated: () => void
}

export function GenerateQuestionSetDialog({ open, onClose, onGenerated }: GenerateQuestionSetDialogProps) {
  const [step, setStep] = useState(1)
  const [importedFile, setImportedFile] = useState<File>()
  const [duplicateMode, setDuplicateMode] = useState('skip')
  const [submitting, setSubmitting] = useState(false)

  const close = () => {
    setStep(1)
    setImportedFile(undefined)
    setSubmitting(false)
    onClose()
  }

  const submit = () => {
    setSubmitting(true)
    window.setTimeout(() => {
      setSubmitting(false)
      MetisMessage.success('已批量生成 10 份题单，2 份异常数据未导入')
      onGenerated()
      close()
    }, 700)
  }

  const footer = <div className="dialog-footer-actions">
    <MetisButton onClick={close}>取消</MetisButton>
    {step > 1 && <MetisButton onClick={() => setStep((current) => current - 1)}>上一步</MetisButton>}
    {step < 3
      ? <MetisButton type="primary" disabled={step === 1 && !importedFile} onClick={() => setStep((current) => current + 1)}>下一步</MetisButton>
      : <MetisButton type="primary" loading={submitting} onClick={submit}>确认批量生成</MetisButton>}
  </div>

  return <MetisDialog title="批量生成题单" open={open} width={920} footer={footer} onCancel={close}>
    <div className="wizard-steps excel-only-steps" aria-label="批量生成步骤">
      {['上传 Excel', '导入配置', '预检确认'].map((label, index) => <div key={label} className={step === index + 1 ? 'active' : step > index + 1 ? 'done' : ''}><span>{index + 1}</span><b>{label}</b></div>)}
    </div>

    {step === 1 && <section className="wizard-panel excel-import-panel" data-sec="1">
      <div className="wizard-panel-heading"><div><strong>上传题单 Excel</strong><p>支持 .xlsx、.xls，单次最多导入 500 份题单、20,000 道题。</p></div><MetisButton onClick={() => MetisMessage.success('题单批量导入模板已下载')}>下载模板</MetisButton></div>
      <label className={`excel-dropzone ${importedFile ? 'has-file' : ''}`}>
        <input type="file" accept=".xlsx,.xls" onChange={(event) => setImportedFile(event.target.files?.[0])} />
        <span className="excel-file-icon">XLS</span>
        <strong>{importedFile ? importedFile.name : '点击选择 Excel 文件'}</strong>
        <p>{importedFile ? `${(importedFile.size / 1024).toFixed(1)} KB · 文件已读取，下一步将进行字段校验` : '或将文件拖拽到此处上传'}</p>
      </label>
      <MetisAlert type="info" showIcon message="一行代表一道题目" description="通过题单唯一标识将多行题目聚合成题单。必填列：题单唯一标识、题单名称、类型、阶段、科目、题目ID、题目顺序；同步练习需填写学年，专题的学年、年级、学期和教材版本可以留空。" />
    </section>}

    {step === 2 && <section className="wizard-panel form-grid" data-sec="2">
      <label className="field-stack"><span>重复题单处理</span><MetisSelect value={duplicateMode} options={[{ label: '跳过已存在题单', value: 'skip' }, { label: '覆盖草稿内容', value: 'replace' }]} onChange={(value) => setDuplicateMode(String(value))} /></label>
      <label className="field-stack"><span>生成后状态</span><MetisSelect value="draft" options={[{ label: '草稿', value: 'draft' }]} /></label>
      <label className="field-stack field-span-2"><span>导入文件</span><MetisInput value={importedFile?.name ?? ''} readOnly /></label>
      <MetisAlert type="warning" showIcon message="批量导入只创建题单草稿" description="题目ID不存在、顺序重复或必填字段缺失的数据将在预检中标记，确认前不会写入题单库。" />
    </section>}

    {step === 3 && <section className="wizard-panel" data-sec="3">
      <div className="precheck-summary"><div><span>Excel 数据行</span><strong>126</strong></div><div><span>识别题单</span><strong>12</strong></div><div><span>可生成</span><strong>10</strong></div><div className="danger"><span>异常题单</span><strong>2</strong></div></div>
      <MetisAlert type="warning" showIcon message="预检完成：10 份可生成，2 份需修正" description="异常数据不会生成；可先导出错误明细，修正后重新导入。" />
      <div className="precheck-list"><div><span><strong>同步练习-19.1</strong>19.1 算术平方根同步练习</span><span>26 题 · 校验通过</span></div><div><span><strong>专题-二次根式</strong>二次根式易错专项</span><span>32 题 · 校验通过</span></div><div><span><strong>同步练习-20.2</strong>分母有理化同步练习</span><span className="danger">缺少题目ID · 已阻断</span></div></div>
    </section>}
  </MetisDialog>
}
