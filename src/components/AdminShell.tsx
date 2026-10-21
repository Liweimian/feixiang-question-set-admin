import type { PropsWithChildren } from 'react'
import { useMemo } from 'react'
import { MetisButton } from '@yuanfudao/metis-web-component'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const navItems = [
  { path: '/assets', label: '题单库' },
  { path: '/jobs', label: '生成任务' },
  { path: '/bindings', label: '目录关联' },
  { path: '/rules', label: '生成规则' },
]

export function AdminShell({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reviewMode = searchParams.get('mode') === 'review'
  const activePath = useMemo(
    () => navItems.find((item) => location.pathname.startsWith(item.path))?.path ?? '/assets',
    [location.pathname],
  )

  const toggleMode = () => {
    const next = new URLSearchParams(searchParams)
    if (reviewMode) next.delete('mode')
    else next.set('mode', 'review')
    navigate(`${location.pathname}${next.size ? `?${next.toString()}` : ''}`)
  }

  return (
    <div className={`admin-app ${reviewMode ? 'is-review' : ''}`}>
      <header className="global-header">
        <div className="brand-lockup" aria-label="飞象内容平台">
          <span className="brand-mark">FX</span>
          <strong>飞象内容平台</strong>
          <span className="environment-pill">原型</span>
        </div>
        <nav className="global-nav" aria-label="平台主导航">
          <span>内容库</span>
          <span className="active">内容生产</span>
          <span>任务管理</span>
          <span>资源库管理</span>
        </nav>
        <div className="account-meta">内容运营 · 王晓慧</div>
      </header>

      <div className="workspace-shell">
        <aside className="module-nav" aria-label="题单管理导航">
          <div className="module-nav-title">
            <span>内容生产</span>
            <strong>题单管理</strong>
          </div>
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={activePath === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              <span>{item.label}</span>
            </button>
          ))}
          <div className="nav-guidance">
            <strong>统一题单资产</strong>
            <p>来源、内容版本和前台目录相互解耦。</p>
          </div>
        </aside>

        <main className="workspace-content">{children}</main>

        {reviewMode && (
          <aside className="review-placeholder" aria-label="过稿看板占位">
            <div>
              <strong>过稿模式</strong>
              <p>当前为阶段一页面原型。产品稿将在页面方案确认后对账生成。</p>
            </div>
            <MetisButton type="borderless" onClick={toggleMode}>退出过稿</MetisButton>
          </aside>
        )}
      </div>

      {!reviewMode && (
        <button className="review-toggle" type="button" onClick={toggleMode} aria-label="进入过稿模式">
          过稿
        </button>
      )}
    </div>
  )
}
