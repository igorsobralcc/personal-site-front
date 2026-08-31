import { Route, Routes } from 'react-router-dom'

import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PresentationPage } from '../pages/PresentationPage'
// Blog routes are intentionally retained for the future publishing phase.
// import { ArticlesPage } from '../pages/ArticlesPage'
// import { ArticlePage } from '../pages/ArticlePage'
import { SiteShell } from '../shared/components/SiteShell'

import type { ReactElement } from 'react'

export function App(): ReactElement {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="presentation" element={<PresentationPage />} />
        {/* Blog routes are hidden until the Blog API contract is approved.
        <Route path="articles" element={<ArticlesPage />} />
        <Route path="articles/:slug" element={<ArticlePage />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
