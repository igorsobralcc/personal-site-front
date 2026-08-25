export interface SocialLink { label: string; url: string }
export interface Profile {
  id: string
  fullName: string
  headline: string
  biography: string
  shortSummary?: string | null
  location?: string | null
  email?: string | null
  availability?: string | null
  currentFocus?: string | null
  socialLinks: SocialLink[]
}
export interface Experience {
  id: string
  company: string
  role: string
  startDate: string
  endDate?: string | null
  summary: string
}
export interface Technology { id: string; name: string }
export interface ProjectImage { url: string; alt: string; width: number; height: number }
export interface Project {
  id: string
  name: string
  summary: string
  repositoryUrl?: string | null
  liveUrl?: string | null
  technologies: Technology[]
  image?: ProjectImage | null
}
export interface SkillCategory {
  id: string
  name: string
  skills: Array<{ id: string; name: string }>
}
export interface Presentation {
  profile: Profile
  experiences: Experience[]
  projects: Project[]
  skillCategories: SkillCategory[]
  updatedAt: string
}

const endpoint = import.meta.env.VITE_PRESENTATION_API_URL ?? '/api/presentation'

const prototypePresentation: Presentation = {
  profile: {
    id: 'prototype-profile', fullName: 'Igor Sobral',
    headline: 'I build software that makes complex things feel simple.',
    shortSummary: 'A software engineer focused on resilient systems, precise interfaces, and the thoughtful details that turn working code into a useful product.',
    biography: 'I work across the stack, shaping clear interfaces and dependable services. My approach pairs systems thinking with a close attention to the people who will use and maintain what I build.',
    location: 'São Paulo, Brazil', email: 'hello@igorsobral.com',
    availability: 'Available for select projects',
    currentFocus: 'Designing dependable product foundations where API clarity, frontend craft, and operational simplicity reinforce each other.',
    socialLinks: [],
  },
  skillCategories: [
    { id: 's1', name: 'Frontend', skills: [{ id: 's11', name: 'React & TypeScript' }, { id: 's12', name: 'Design systems' }, { id: 's13', name: 'Accessible interfaces' }] },
    { id: 's2', name: 'Backend', skills: [{ id: 's21', name: '.NET & C#' }, { id: 's22', name: 'API architecture' }, { id: 's23', name: 'PostgreSQL' }] },
    { id: 's3', name: 'Practice', skills: [{ id: 's31', name: 'Domain modeling' }, { id: 's32', name: 'Testing strategy' }, { id: 's33', name: 'Technical leadership' }] },
  ],
  projects: [
    { id: 'p1', name: 'Personal Site Platform', summary: 'A contract-first publishing and presentation platform built as independently deployable services with a fast, accessible public interface.', technologies: [{ id: 't1', name: 'React' }, { id: 't2', name: '.NET' }, { id: 't3', name: 'PostgreSQL' }], repositoryUrl: 'https://github.com/igorsobralcc' },
    { id: 'p2', name: 'Systems Toolkit', summary: 'Reusable patterns and small tools for making distributed product systems easier to understand, test, and operate.', technologies: [{ id: 't4', name: 'TypeScript' }, { id: 't5', name: 'OpenAPI' }] },
  ],
  experiences: [
    { id: 'e1', company: 'Independent', role: 'Software Engineer', startDate: '2024-01-01', endDate: null, summary: 'Building product systems end to end, with an emphasis on durable architecture and calm, legible user experiences.' },
    { id: 'e2', company: 'Product teams', role: 'Full-stack Engineer', startDate: '2021-01-01', endDate: '2023-12-31', summary: 'Delivered customer-facing experiences and the services behind them while improving shared engineering foundations.' },
  ],
  updatedAt: new Date().toISOString(),
}

export async function getPresentation(signal?: AbortSignal): Promise<Presentation> {
  try {
    const response = await fetch(endpoint, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(response.status === 404 ? 'Presentation unavailable' : 'Unable to load the presentation')
    return response.json() as Promise<Presentation>
  } catch (error) {
    if (import.meta.env.DEV && !signal?.aborted) return prototypePresentation
    throw error
  }
}
