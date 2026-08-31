import { afterEach, describe, expect, it, vi } from 'vitest'

import { articleBlockSchema, articlePageSchema, articleSchema, articleSummarySchema } from './blog'
import { ApiContractError, parseContract } from './contract'
import { getPresentation, presentationSchema } from './presentation'

const validPresentation = {
  profile: {
    id: 'profile-1',
    fullName: 'Igor Sobral',
    headline: 'Software Engineer',
    biography: 'Builds dependable software.',
    socialLinks: [{ label: 'GitHub', url: 'https://github.com/igorsobralcc' }],
  },
  experiences: [
    {
      id: 'experience-1',
      company: 'Independent',
      role: 'Software Engineer',
      startDate: '2024-01-01',
      endDate: null,
      summary: 'Building products.',
    },
  ],
  projects: [],
  skillCategories: [],
  updatedAt: '2026-08-31T12:00:00.000Z',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('API contract parsing', () => {
  it('accepts a valid presentation and strips additive fields', () => {
    const parsed = parseContract(
      presentationSchema,
      { ...validPresentation, futureServerField: 'ignored' },
      'presentation',
    )

    expect(parsed.profile.fullName).toBe('Igor Sobral')
    expect(parsed).not.toHaveProperty('futureServerField')
  })

  it('rejects malformed required presentation data without retaining the payload', () => {
    const secretPayload = { ...validPresentation, profile: { fullName: 'secret-value' } }

    expect(() => parseContract(presentationSchema, secretPayload, 'presentation')).toThrow(
      ApiContractError,
    )

    try {
      parseContract(presentationSchema, secretPayload, 'presentation')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiContractError)
      expect(JSON.stringify(error)).not.toContain('secret-value')
    }
  })

  it('normalizes an unknown article block without preserving raw properties', () => {
    const parsed = parseContract(
      articleBlockSchema,
      { type: 'embed', html: '<script>unsafe()</script>' },
      'article block',
    )

    expect(parsed).toEqual({ type: 'unsupported', originalType: 'embed' })
  })

  it('rejects malformed content using a known article discriminator', () => {
    expect(() =>
      parseContract(
        articleBlockSchema,
        { type: 'image', url: 'javascript:alert(1)', width: 0, height: 100 },
        'article block',
      ),
    ).toThrow(ApiContractError)
  })

  it('accepts empty article pages and valid partial summaries', () => {
    expect(articlePageSchema.parse({ items: [], nextCursor: null })).toEqual({
      items: [],
      nextCursor: null,
    })
    expect(
      articleSummarySchema.parse({
        id: 'article-1',
        slug: 'safe-contracts',
        title: 'Safe contracts',
        summary: 'Validate data once.',
        publishedAt: '2026-08-31',
      }),
    ).toMatchObject({ slug: 'safe-contracts' })
  })

  it('parses known and unsupported blocks in a complete article', () => {
    const parsed = articleSchema.parse({
      id: 'article-1',
      slug: 'safe-contracts',
      title: 'Safe contracts',
      summary: 'Validate data once.',
      publishedAt: '2026-08-31',
      body: [
        { type: 'paragraph', text: 'Trusted text.' },
        { type: 'future-block', arbitrary: 'discarded' },
      ],
    })

    expect(parsed.body).toEqual([
      { type: 'paragraph', text: 'Trusted text.' },
      { type: 'unsupported', originalType: 'future-block' },
    ])
  })

  it('does not hide a malformed live presentation behind development fixtures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ profile: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    await expect(getPresentation()).rejects.toBeInstanceOf(ApiContractError)
  })
})
