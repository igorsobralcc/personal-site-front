import { z } from 'zod'

import { ApiContractError, parseContract } from './contract'

const nonEmptyString = z.string().trim().min(1)
const nullableText = nonEmptyString.nullish()
const httpUrl = z.url({ protocol: /^https?$/ })

export const socialLinkSchema = z.object({
  label: nonEmptyString,
  url: httpUrl,
})

export const profileSchema = z.object({
  id: nonEmptyString,
  fullName: nonEmptyString,
  headline: nonEmptyString,
  biography: nonEmptyString,
  shortSummary: nullableText,
  location: nullableText,
  email: z.email().nullish(),
  availability: nullableText,
  currentFocus: nullableText,
  socialLinks: z.array(socialLinkSchema),
})

export const experienceSchema = z.object({
  id: nonEmptyString,
  company: nonEmptyString,
  role: nonEmptyString,
  startDate: z.iso.date(),
  endDate: z.iso.date().nullish(),
  summary: nonEmptyString,
})

export const technologySchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
})

export const projectImageSchema = z.object({
  url: httpUrl,
  alt: nonEmptyString,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})

export const projectSchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  summary: nonEmptyString,
  repositoryUrl: httpUrl.nullish(),
  liveUrl: httpUrl.nullish(),
  technologies: z.array(technologySchema),
  image: projectImageSchema.nullish(),
})

export const skillCategorySchema = z.object({
  id: nonEmptyString,
  name: nonEmptyString,
  skills: z.array(
    z.object({
      id: nonEmptyString,
      name: nonEmptyString,
    }),
  ),
})

export const presentationSchema = z.object({
  profile: profileSchema,
  experiences: z.array(experienceSchema),
  projects: z.array(projectSchema),
  skillCategories: z.array(skillCategorySchema),
  updatedAt: z.iso.datetime({ offset: true }),
})

export type Presentation = z.infer<typeof presentationSchema>

const endpoint = import.meta.env.VITE_PRESENTATION_API_URL ?? '/api/presentation'

const prototypePresentation = {
  profile: {
    id: 'prototype-profile',
    fullName: 'Igor Sobral',
    headline: 'I build software that makes complex things feel simple.',
    shortSummary:
      'A software engineer focused on resilient systems, precise interfaces, and the thoughtful details that turn working code into a useful product.',
    biography:
      'I work across the stack, shaping clear interfaces and dependable services. My approach pairs systems thinking with a close attention to the people who will use and maintain what I build.',
    location: 'São Paulo, Brazil',
    email: 'hello@igorsobral.com',
    availability: 'Available for select projects',
    currentFocus:
      'Designing dependable product foundations where API clarity, frontend craft, and operational simplicity reinforce each other.',
    socialLinks: [],
  },
  skillCategories: [
    {
      id: 's1',
      name: 'Frontend',
      skills: [
        { id: 's11', name: 'React & TypeScript' },
        { id: 's12', name: 'Design systems' },
        { id: 's13', name: 'Accessible interfaces' },
      ],
    },
    {
      id: 's2',
      name: 'Backend',
      skills: [
        { id: 's21', name: '.NET & C#' },
        { id: 's22', name: 'API architecture' },
        { id: 's23', name: 'PostgreSQL' },
      ],
    },
    {
      id: 's3',
      name: 'Practice',
      skills: [
        { id: 's31', name: 'Domain modeling' },
        { id: 's32', name: 'Testing strategy' },
        { id: 's33', name: 'Technical leadership' },
      ],
    },
  ],
  projects: [
    {
      id: 'p1',
      name: 'Personal Site Platform',
      summary:
        'A contract-first publishing and presentation platform built as independently deployable services with a fast, accessible public interface.',
      technologies: [
        { id: 't1', name: 'React' },
        { id: 't2', name: '.NET' },
        { id: 't3', name: 'PostgreSQL' },
      ],
      repositoryUrl: 'https://github.com/igorsobralcc',
    },
    {
      id: 'p2',
      name: 'Systems Toolkit',
      summary:
        'Reusable patterns and small tools for making distributed product systems easier to understand, test, and operate.',
      technologies: [
        { id: 't4', name: 'TypeScript' },
        { id: 't5', name: 'OpenAPI' },
      ],
    },
  ],
  experiences: [
    {
      id: 'e1',
      company: 'Independent',
      role: 'Software Engineer',
      startDate: '2024-01-01',
      endDate: null,
      summary:
        'Building product systems end to end, with an emphasis on durable architecture and calm, legible user experiences.',
    },
    {
      id: 'e2',
      company: 'Product teams',
      role: 'Full-stack Engineer',
      startDate: '2021-01-01',
      endDate: '2023-12-31',
      summary:
        'Delivered customer-facing experiences and the services behind them while improving shared engineering foundations.',
    },
  ],
  updatedAt: new Date().toISOString(),
} satisfies z.input<typeof presentationSchema>

export async function getPresentation(signal?: AbortSignal): Promise<Presentation> {
  try {
    const response = await fetch(endpoint, { signal, headers: { Accept: 'application/json' } })
    if (!response.ok)
      throw new Error(
        response.status === 404 ? 'Presentation unavailable' : 'Unable to load the presentation',
      )
    const body: unknown = await response.json()
    return parseContract(presentationSchema, body, 'presentation')
  } catch (error) {
    if (error instanceof ApiContractError) throw error
    if (import.meta.env.DEV && !signal?.aborted) {
      return parseContract(presentationSchema, prototypePresentation, 'presentation fixture')
    }
    throw error
  }
}
