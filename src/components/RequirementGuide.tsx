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
          '章节详情新增「关联题单」Tab，列表展示题单ID、题单名称、已关联分类、题单状态和操作。',
          '点击「＋关联题单」打开题单库。关系按「同步练习树 + 当前章节 + 题单」校验；只禁止当前章节重复关联。',
          '弹窗筛选项：题单ID、名称、题目ID、已关联分类、年级、学年、学期、教材版本、来源练习册ID、状态、目录关联；不展示阶段、科目、生产方式。',
          '筛选条件点击「搜索」后生效；点击「重置」清空条件并恢复全部题单。',
          '题单已关联其他教材章节或专题节点时，仍可继续关联当前章节。',
          '「解除关联」只删除当前章节关系，不删除题单，也不影响其他教材章节或专题节点的关系。',
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
          '点击「＋关联题单」打开题单库。关系按「专题树 + 当前节点 + 题单」校验；只禁止当前节点重复关联。',
          '弹窗筛选项：题单ID、名称、题目ID、已关联分类、年级、学年、学期、教材版本、来源练习册ID、状态、目录关联；不展示阶段、科目、生产方式。',
          '筛选条件点击「搜索」后生效；点击「重置」清空条件并恢复全部题单。',
          '题单已关联其他专题节点或教材章节时，仍可继续关联当前节点。',
          '「移除」只删除当前节点关系，不删除题单，也不影响其他专题节点或教材章节的关系。',
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
        title: '1. 题单与目录关系',
        items: [
          '题单主数据不保存同步练习或专题类型；用途由它关联的目录决定。',
          '一个题单可关联多个教材章节、多个专题节点，也可同时关联两类目录。关系唯一性按「树分类 + 节点 + 题单」校验。',
          '原「类型」统一改为「已关联分类」，由未失效目录关系实时汇总。可同时展示「同步练习树」「专题树」；无关联显示「-」。',
          '解除某类的最后一条关系后，才移除该分类标签；同类还有其他节点关系时，标签继续保留。',
        ],
      },
      {
        title: '2. 筛选与列表',
        items: [
          '「已关联分类」按包含关系筛选；题单同时关联两类目录时，在两个筛选结果中都应命中。',
          '列表展示全部已关联分类及各类未失效节点数量。目录关联仍只有「已关联」「未关联」，并保留创建时间、创建人。',
          '操作列提供状态控制、操作记录、生产记录和删除。',
        ],
      },
      {
        title: '3. 题单详情',
        items: [
          '页面先展示基本信息，下方为「题目」「操作记录」「生产记录」三个 Tab。',
          '基本信息按同步练习树、专题树分组展示全部目录路径，每条路径可点击定位对应节点。',
          '解除一条关系后重新汇总已关联分类和节点数量，其他目录关系不受影响。',
          '「题目」按模块管理，支持新建模块、关联题目、移出和排序；不设置分值。',
          '支持按题目ID和题目状态查询。题目状态只有「上线」「下线」，不设置「待检查」。',
          '基本信息不展示负责人、题量/建议时长和更新时间；综合难度并入标签。',
        ],
      },
      {
        title: '4. 批量生成',
        items: [
          '批量生成只支持 Excel，流程为「上传 Excel → 导入配置 → 预检确认」。异常题单不写入，生成结果均为草稿。',
          'Excel 不填写题单类型；新题单默认未关联，关联分类在绑定目录后产生。',
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
