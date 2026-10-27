import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/AdminShell'
import { CatalogBindingPage } from './pages/CatalogBindingPage'
import { GenerationJobsPage } from './pages/GenerationJobsPage'
import { GenerationRulesPage } from './pages/GenerationRulesPage'
import { QuestionSetDetailPage } from './pages/QuestionSetDetailPage'
import { QuestionSetEditorPage } from './pages/QuestionSetEditorPage'
import { QuestionSetListPage } from './pages/QuestionSetListPage'

export function App() {
  return (
    <AdminShell>
      <Routes>
        <Route path="/assets" element={<QuestionSetListPage />} />
        <Route path="/assets/:id/edit" element={<QuestionSetEditorPage />} />
        <Route path="/assets/:id" element={<QuestionSetDetailPage />} />
        <Route path="/jobs" element={<GenerationJobsPage />} />
        <Route path="/catalogs" element={<CatalogBindingPage mode="textbook" />} />
        <Route path="/topic-tree" element={<CatalogBindingPage mode="topic" />} />
        <Route path="/bindings" element={<Navigate to="/catalogs" replace />} />
        <Route path="/rules" element={<GenerationRulesPage />} />
        <Route path="*" element={<Navigate to="/assets" replace />} />
      </Routes>
    </AdminShell>
  )
}
