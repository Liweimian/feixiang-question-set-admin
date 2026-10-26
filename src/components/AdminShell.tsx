import type { PropsWithChildren } from 'react'
import { useMemo, useState } from 'react'
import { MetisButton, MetisMessage } from '@yuanfudao/metis-web-component'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

const navItems: Array<{ path?: string; label: string }> = [
  { label: '题目' },
  { label: '标签管理' },
  { label: '知识点' },
  { path: '/catalogs', label: '教材目录' },
  { path: '/topic-tree', label: '专题树' },
  { label: '主题' },
  { label: '策略' },
  { label: '技能' },
  { label: '词汇' },
  { label: '核心素养' },
  { label: '业务标签' },
  { label: '练习册' },
  { label: '试卷' },
  { path: '/assets', label: '题单库' },
  { label: '作文素材' },
  { label: '书城' },
]

export function AdminShell({ children }: PropsWithChildren) {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [libraryMenuOpen, setLibraryMenuOpen] = useState(false)
  const reviewMode = searchParams.get('mode') === 'review'
  const activePath = useMemo(() => {
    if (location.pathname.startsWith('/catalogs')) return '/catalogs'
    if (location.pathname.startsWith('/topic-tree')) return '/topic-tree'
    return '/assets'
  }, [location.pathname])

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
          <div className="library-menu-wrap">
            <button
              type="button"
              className="library-menu-trigger active"
              aria-expanded={libraryMenuOpen}
              aria-haspopup="menu"
              onClick={() => setLibraryMenuOpen((open) => !open)}
            >
              内容库 <span aria-hidden="true">▾</span>
            </button>
            {libraryMenuOpen && (
              <div className="library-dropdown" role="menu" aria-label="内容库菜单">
                <div className="library-dropdown-heading"><span>资源库管理</span><strong>内容库</strong></div>
                <div className="library-dropdown-scroll">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      role="menuitem"
                      className={activePath === item.path ? 'active' : ''}
                      onClick={() => {
                        setLibraryMenuOpen(false)
                        if (item.path) navigate(item.path)
                        else MetisMessage.info(`${item.label}为现有内容库页面，本原型不展开`)
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <span>内容生产</span>
          <span>任务管理</span>
          <span>培训考试</span>
          <span>资源库管理</span>
        </nav>
        <div className="account-meta">内容运营 · 王晓慧</div>
      </header>

      {libraryMenuOpen && <button className="library-menu-backdrop" type="button" aria-label="关闭内容库菜单" onClick={() => setLibraryMenuOpen(false)} />}

      <div className="workspace-shell">
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
