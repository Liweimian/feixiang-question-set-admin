import { useEffect, useMemo, useState } from 'react'
import { MetisButton, MetisEmpty, MetisInput, MetisMessage, MetisSelect, MetisTabs, MetisTag } from '@yuanfudao/metis-web-component'
import { useNavigate, useParams } from 'react-router-dom'
import { detailQuestions, questionPool } from '../data/mockData'
import type { QuestionItem, QuestionSet } from '../features/question-sets/types'
import { questionSetRepository } from '../services/questionSetRepository'

const sourceTabs = [
  { key: 'catalog', label: '教材 / 知识点' },
  { key: 'workbook', label: '练习册' },
  { key: 'paper', label: '试卷' },
  { key: 'questionSet', label: '题单' },
  { key: 'mine', label: '我的题目' },
]

const chapterNodes = ['第19章 实数', '19.1(1) 算术平方根', '19.1(2) 平方根', '19.1(3) 立方根', '第20章 二次根式']

export function QuestionSetEditorPage() {
  const navigate = useNavigate()
  const { id = 'QS-10458' } = useParams()
  const [record, setRecord] = useState<QuestionSet>()
  const [source, setSource] = useState('catalog')
  const [chapter, setChapter] = useState('19.1(1) 算术平方根')
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState<string>()
  const [difficulty, setDifficulty] = useState<string>()
  const [selected, setSelected] = useState<QuestionItem[]>(detailQuestions)

  useEffect(() => { void questionSetRepository.get(id).then(setRecord) }, [id])

  const candidates = useMemo(() => questionPool.filter((item) => {
    const textMatched = !keyword || `${item.id}${item.stem}${item.sourceModule}`.includes(keyword)
    return textMatched && (!type || item.type === type) && (!difficulty || item.difficulty === difficulty)
  }), [difficulty, keyword, type])

  const addQuestion = (item: QuestionItem) => {
    if (selected.some((question) => question.id === item.id)) return
    setSelected((current) => [...current, { ...item, order: current.length + 1, origin: 'manual' }])
  }

  const removeQuestion = (questionId: string) => setSelected((current) => current.filter((item) => item.id !== questionId).map((item, index) => ({ ...item, order: index + 1 })))

  const moveQuestion = (questionId: string, delta: number) => setSelected((current) => {
    const sourceIndex = current.findIndex((item) => item.id === questionId)
    const targetIndex = sourceIndex + delta
    if (sourceIndex < 0 || targetIndex < 0 || targetIndex >= current.length) return current
    const next = [...current]
    const [moved] = next.splice(sourceIndex, 1)
    next.splice(targetIndex, 0, moved)
    return next.map((item, index) => ({ ...item, order: index + 1 }))
  })

  if (!record) return <div className="page-container"><div className="loading-card">正在加载题单编辑器…</div></div>

  return <div className="question-set-editor-page">
    <header className="question-editor-header">
      <div><button className="back-link" type="button" onClick={() => navigate(`/assets/${record.id}`)}>← 返回题单详情</button><h1>编辑题单内容</h1><p>{record.title} · {record.id}</p></div>
      <div><span>已选 <strong>{selected.length}</strong> 题</span><MetisButton onClick={() => navigate(`/assets/${record.id}`)}>取消</MetisButton><MetisButton type="primary" disabled={!selected.length} onClick={() => { MetisMessage.success(`已保存 ${selected.length} 道题`); navigate(`/assets/${record.id}`) }}>保存题单</MetisButton></div>
    </header>

    <section className="question-editor-source-tabs"><MetisTabs activeKey={source} onChange={setSource} items={sourceTabs} /></section>

    <main className="question-editor-workbench">
      <aside className="question-source-panel">
        <MetisTabs activeKey="chapter" items={[{ key: 'chapter', label: '教材章节' }, { key: 'knowledge', label: '知识点' }]} />
        <MetisSelect value="hj" options={[{ label: '沪教版(五四制) · 八年级上册', value: 'hj' }]} />
        <MetisInput placeholder="搜索章节名称" />
        <div className="question-source-tree">{chapterNodes.map((item, index) => <button key={item} type="button" className={`${index > 0 && index < 4 ? 'level-1' : ''} ${chapter === item ? 'active' : ''}`} onClick={() => setChapter(item)}><span>{index === 0 || index === 4 ? '▾ ' : ''}{item}</span>{item === chapter && <span>当前</span>}</button>)}</div>
      </aside>

      <section className="question-candidate-panel">
        <div className="candidate-heading"><div><h2>{chapter}</h2><p>{sourceTabs.find((item) => item.key === source)?.label}题目资源</p></div><MetisTag color="processing">共 {candidates.length} 题</MetisTag></div>
        <div className="candidate-filters">
          <MetisSelect allowClear value={type} placeholder="全部题型" options={[{ label: '单选题', value: '单选题' }, { label: '填空题', value: '填空题' }, { label: '解答题', value: '解答题' }]} onChange={(value) => setType(value ? String(value) : undefined)} />
          <MetisSelect allowClear value={difficulty} placeholder="全部难度" options={[{ label: '容易', value: '容易' }, { label: '较易', value: '较易' }, { label: '中等', value: '中等' }]} onChange={(value) => setDifficulty(value ? String(value) : undefined)} />
          <MetisInput value={keyword} placeholder="搜索题目ID或题干" onChange={(event) => setKeyword(event.target.value)} />
          <MetisButton onClick={() => undefined}>搜索</MetisButton>
        </div>
        <MetisTabs activeKey="recommended" items={[{ key: 'recommended', label: '推荐题目' }, { key: 'latest', label: '最新题目' }]} />
        <div className="candidate-list">{candidates.length ? candidates.map((item) => {
          const added = selected.some((question) => question.id === item.id)
          return <article key={item.id} className={added ? 'selected' : ''}><div className="candidate-question-meta"><span>{item.id}</span><MetisTag>{item.type}</MetisTag><MetisTag color={item.difficulty === '中等' ? 'warning' : 'success'}>{item.difficulty}</MetisTag></div><p>{item.stem}</p><footer><span>{item.sourceModule} · 版本 {item.revision}</span><MetisButton type={added ? 'default' : 'primary'} disabled={added} onClick={() => addQuestion(item)}>{added ? '已添加' : '添加'}</MetisButton></footer></article>
        }) : <MetisEmpty description="没有符合条件的题目" />}</div>
      </section>

      <aside className="question-basket-panel">
        <div className="basket-heading"><div><h2>题目篮</h2><p>已选 {selected.length} 题 · 预计 {Math.max(1, Math.ceil(selected.length * 1.2))} 分钟</p></div><MetisButton type="borderless" disabled={!selected.length} onClick={() => setSelected([])}>清空</MetisButton></div>
        <div className="basket-list">{selected.length ? selected.map((item, index) => <article key={item.id}><div><span>{index + 1}</span><div><strong>{item.type} · {item.id}</strong><p>{item.stem}</p></div></div><footer><MetisTag color={item.origin === 'manual' ? 'purple' : 'processing'}>{item.origin === 'manual' ? '人工添加' : '来源继承'}</MetisTag><div><MetisButton type="borderless" disabled={index === 0} onClick={() => moveQuestion(item.id, -1)}>上移</MetisButton><MetisButton type="borderless" disabled={index === selected.length - 1} onClick={() => moveQuestion(item.id, 1)}>下移</MetisButton><MetisButton type="borderless" onClick={() => removeQuestion(item.id)}>移除</MetisButton></div></footer></article>) : <MetisEmpty description="还没有选择题目" />}</div>
      </aside>
    </main>
  </div>
}
