import type { Article, ArticleSummary } from '../shared/api/blog'
import type { Presentation } from '../shared/api/presentation'

export const presentationFixture: Presentation = {
  profile: {
    id: 'profile-1',
    fullName: 'Igor Sobral',
    headline: 'Build dependable products',
    shortSummary: 'A concise professional summary.',
    biography: 'A complete professional biography.',
    location: 'São Paulo, Brazil',
    email: 'igor@example.com',
    availability: 'Available for projects',
    currentFocus: 'Making complex systems easier to use.',
    socialLinks: [
      { label: 'GitHub', url: 'https://github.com/example' },
      { label: 'LinkedIn', url: 'https://linkedin.com/in/example' },
    ],
  },
  skillCategories: [
    {
      id: 'skill-group-1',
      name: 'Frontend',
      skills: [
        { id: 'skill-1', name: 'React' },
        { id: 'skill-2', name: 'Accessibility' },
      ],
    },
    { id: 'skill-group-2', name: 'Backend', skills: [{ id: 'skill-3', name: '.NET' }] },
  ],
  projects: [
    {
      id: 'project-1',
      name: 'Portfolio Platform',
      summary: 'A public presentation platform.',
      liveUrl: 'https://example.com/live',
      repositoryUrl: 'https://github.com/example/source',
      technologies: [
        { id: 'tech-1', name: 'React' },
        { id: 'tech-2', name: 'TypeScript' },
      ],
      image: {
        url: 'https://example.com/project.png',
        alt: 'Portfolio project',
        width: 640,
        height: 360,
      },
    },
    {
      id: 'project-2',
      name: 'Systems Toolkit',
      summary: 'Reusable engineering tools.',
      liveUrl: null,
      repositoryUrl: null,
      technologies: [],
      image: null,
    },
  ],
  experiences: [
    {
      id: 'experience-1',
      company: 'Independent',
      role: 'Engineer',
      startDate: '2024-01-01',
      endDate: null,
      summary: 'Current work.',
    },
    {
      id: 'experience-2',
      company: 'Product Team',
      role: 'Developer',
      startDate: '2021-01-01',
      endDate: '2023-12-31',
      summary: 'Previous work.',
    },
  ],
  updatedAt: '2026-08-31T00:00:00Z',
}

export function presentation(overrides: Partial<Presentation> = {}): Presentation {
  return {
    ...presentationFixture,
    ...overrides,
    profile: { ...presentationFixture.profile, ...(overrides.profile ?? {}) },
    skillCategories: overrides.skillCategories ?? presentationFixture.skillCategories,
    projects: overrides.projects ?? presentationFixture.projects,
    experiences: overrides.experiences ?? presentationFixture.experiences,
  }
}

export const articleSummaryFixture: ArticleSummary = {
  id: 'article-1',
  slug: 'dependable-products',
  title: 'Building dependable products',
  summary: 'A practical article summary.',
  publishedAt: '2026-08-18T00:00:00Z',
  readingTimeMinutes: 7,
  topic: 'Engineering',
}

export const articleSummary = (overrides: Partial<ArticleSummary> = {}): ArticleSummary => ({
  ...articleSummaryFixture,
  ...overrides,
})

export const articleFixture: Article = {
  ...articleSummaryFixture,
  seoTitle: 'Dependable product engineering',
  seoDescription: 'Description',
  canonicalUrl: 'https://example.com/articles/dependable-products',
  body: [
    { type: 'paragraph', text: 'Opening paragraph.' },
    { type: 'heading', text: 'A useful heading' },
    { type: 'quote', text: 'A useful quotation.' },
    { type: 'list', ordered: false, items: ['First', 'Second'] },
    { type: 'list', ordered: true, items: ['One', 'Two'] },
    { type: 'code', language: 'typescript', code: 'const value = 1\n' },
    {
      type: 'image',
      url: 'https://example.com/article.png',
      alt: 'Article diagram',
      width: 800,
      height: 450,
      caption: 'Diagram caption',
    },
    { type: 'table', caption: 'Comparison', headers: ['Choice', 'Result'], rows: [['A', 'Good']] },
    { type: 'unsupported', originalType: 'future-block' },
  ],
}

export const article = (overrides: Partial<Article> = {}): Article => ({
  ...articleFixture,
  ...overrides,
})
