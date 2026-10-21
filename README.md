# 飞象题单管理后台原型

一个基于 React、TypeScript 与 Metis Design 构建的桌面端 B 侧原型，用于验证“练习册等内容来源 → 可运营题单 → 同步/专题目录投放”的完整链路。

## 运行

```bash
npm install
npm run dev
```

浏览器打开终端输出的本地地址。生产构建与本地预览：

```bash
npm run typecheck
npm run build
npm run preview
```

## 页面

- `#/assets`：题单库、筛选、状态视图与练习册生成向导
- `#/assets/QS-10458`：题目编排、来源映射、目录投放、版本与日志
- `#/jobs`：自动/人工生成任务、章节级结果与异常重试
- `#/bindings`：同步树/专题树与题单的绑定工作台
- `#/rules`：自动生成规则、人工保护、质检门禁与规则试跑

## 目录

- `src/features/question-sets`：题单领域类型与页面实现
- `src/components`：后台框架、状态标签与生成向导
- `src/data`：用于评审的真实感 mock 数据
- `src/services`：可替换为后端 API 的仓储接口
- `AGENT-HANDOFF.md`：产品决策、边界条件与后续接力说明

## 当前范围

API、鉴权、拖拽排序、真实题目预览和权限控制为 mock 或交互示意。原型按“末级章节下全部模块、题目 ID 去重、只自动生成草稿”的口径实现；这三项需要在研发接入前确认。

