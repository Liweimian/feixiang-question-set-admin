import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminShell } from './components/AdminShell'
import { CatalogBindingPage } from './pages/CatalogBindingPage'
import { GenerationJobsPage } from './pages/GenerationJobsPage'
import { GenerationRulesPage } from './pages/GenerationRulesPage'
import { QuestionSetDetailPage } from './pages/QuestionSetDetailPage'
import { QuestionSetListPage } from './pages/QuestionSetListPage'

export function App() {
  return (
    <AdminShell>
      <Routes>
        <Route path="/assets" element={<QuestionSetListPage />} />
        <Route path="/assets/:id" element={<QuestionSetDetailPage />} />
        <Route path="/jobs" element={<GenerationJobsPage />} />
        <Route path="/bindings" element={<CatalogBindingPage />} />
        <Route path="/rules" element={<GenerationRulesPage />} />
        <Route path="*" element={<Navigate to="/assets" replace />} />
      </Routes>
    </AdminShell>
  )
}
