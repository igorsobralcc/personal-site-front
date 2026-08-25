import { Route, Routes } from 'react-router-dom'
import { SiteShell } from '../shared/components/SiteShell'
import { HomePage } from '../pages/HomePage'
import { PresentationPage } from '../pages/PresentationPage'
import { ArticlesPage } from '../pages/ArticlesPage'
import { ArticlePage } from '../pages/ArticlePage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="presentation" element={<PresentationPage />} />
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/:slug" element={<ArticlePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
