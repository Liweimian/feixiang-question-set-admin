import { useEffect, useMemo, useState } from 'react'
import { MetisButton, MetisDialog } from '@yuanfudao/metis-web-component'
import { useLocation } from 'react-router-dom'

interface RequirementSection {
  title: string
  items: string[]
}

interface RequirementDocument {
  title: string
  note?: string
  sections: RequirementSection[]
}

const requirementDocuments: Record<'catalogs' | 'topicTree' | 'questionSets', RequirementDocument> = {
  catalogs: {
    title: '教材目录（本次新增）',
    note: '原有教材树、章节信息及其他关联能力保持不变。',
    sections: [
      {
        title: '1. 关联题单',
        items: [
          '章节详情新增「关联题单」Tab，列表展示题单ID、题单名称、题单类型、题单状态和操作。',
          '点击「＋关联题单」打开题单库弹窗，可按题单ID、名称或来源章节搜索；已关联题单不可重复关联。关联成功后关闭弹窗，并刷新当前章节列表。',
          '题单ID、名称和「查看」均进入题单详情；「解除关联」只删除当前章节与题单的关系，不删除题单。',
        ],
      },
      {
        title: '2. 关联题目筛选',
        items: [
          '「关联题目」Tab 增加状态、来源、题目分层、可见资源库、难度 5 个筛选项，统一使用可清空下拉框。',
          '筛选只作用于当前章节的题目列表，其他关联 Tab 不展示。',
        ],
      },
    ],
  },
  topicTree: {
    title: '专题树',
    sections: [
      {
        title: '1. 专题节点',
        items: [
          '左侧按学段、科目维护专题树，支持搜索、展开、排序和新建节点；节点可编辑、上线或下线。',
          '选择节点后，右侧展示节点名称、ID和状态。',
        ],
      },
      {
        title: '2. 关联题单',
        items: [
          '专题节点只保留「关联题单」「操作记录」两个 Tab，不关联知识点、试卷或单题。',
          '点击「＋关联题单」打开题单库弹窗，可搜索并就地关联；已关联题单不可重复关联。',
          '题单ID、名称和「查看」均进入题单详情；「移除」只删除当前节点与题单的关系，不删除题单。',
        ],
      },
      {
        title: '3. 操作记录',
        items: ['记录节点编辑、上下线、关联和移除题单，展示操作内容、操作人和操作时间。'],
      },
    ],
  },
  questionSets: {
    title: '题单库',
    sections: [
      {
        title: '1. 管理范围',
        items: [
          '统一管理「同步练习」「专题」两类题单。同步练习通常填写年级、学年、学期和教材版本；专题允许为空，列表显示「-」。',
          '题单ID、名称和来源支持点击，分别定位到题单详情或来源练习册。',
        ],
      },
      {
        title: '2. 筛选与列表',
        items: [
          '筛选项：题单ID、名称、题目ID、类型、阶段、科目、年级、学年、学期、教材版本、生产方式、来源练习册ID、状态、目录关联。',
          '列表按字段独立展示，并保留创建时间、创建人。目录关联只有「已关联」「未关联」两种状态。',
          '操作列提供状态控制、操作记录、生产记录和删除。',
        ],
      },
      {
        title: '3. 题单详情',
        items: [
          '页面先展示基本信息，下方为「题目」「操作记录」「生产记录」三个 Tab。',
          '「题目」按模块管理，支持新建模块、关联题目、移出、排序/分值，并可按题目ID和生产状态查询。',
          '基本信息不展示负责人、题量/建议时长和更新时间；综合难度并入标签。',
        ],
      },
      {
        title: '4. 批量生成',
        items: [
          '批量生成只支持 Excel，流程为「上传 Excel → 导入配置 → 预检确认」。异常题单不写入，生成结果均为草稿。',
          '当前不包含提交审核流程。',
        ],
      },
    ],
  },
}

function getRequirementDocument(pathname: string) {
  if (pathname.startsWith('/catalogs')) return requirementDocuments.catalogs
  if (pathname.startsWith('/topic-tree')) return requirementDocuments.topicTree
  if (pathname.startsWith('/assets')) return requirementDocuments.questionSets
  return null
}

export function RequirementGuide() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const document = useMemo(() => getRequirementDocument(location.pathname), [location.pathname])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  if (!document) return null

  return (
    <>
      <div className="requirement-guide-entry">
        <MetisButton
          type="borderless"
          data-track={`/click/global/requirements | 需求说明 | ${document.title}`}
          onClick={() => setOpen(true)}
        >
          需求说明
        </MetisButton>
      </div>
      <MetisDialog
        title={`需求说明 · ${document.title}`}
        open={open}
        width={760}
        footer={null}
        onCancel={() => setOpen(false)}
      >
        <article className="requirement-guide-content">
          {document.note && <p className="requirement-guide-note">{document.note}</p>}
          {document.sections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </section>
          ))}
        </article>
      </MetisDialog>
    </>
  )
}
