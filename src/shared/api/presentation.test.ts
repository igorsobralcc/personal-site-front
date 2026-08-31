import { afterEach, describe, expect, it, vi } from 'vitest'

import { getPresentation } from './presentation'
import { presentationFixture } from '../../test/fixtures'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('Presentation API', () => {
  it('PRE-001 PRE-003 requests JSON with a signal and returns successful data', async () => {
    vi.stubEnv('DEV', false)
    const signal = new AbortController().signal
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue({ ok: true, json: async () => presentationFixture } as Response)

    await expect(getPresentation(signal)).resolves.toEqual(presentationFixture)
    expect(fetchMock).toHaveBeenCalledWith('/api/presentation', {
      signal,
      headers: { Accept: 'application/json' },
    })
  })

  it.each([
    [404, 'Presentation unavailable'],
    [500, 'Unable to load the presentation'],
  ])('PRE-004 classifies production status %s', async (status, message) => {
    vi.stubEnv('DEV', false)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status } as Response)
    await expect(getPresentation()).rejects.toThrow(message)
  })

  it('PRE-005 propagates production transport failures', async () => {
    vi.stubEnv('DEV', false)
    const failure = new Error('offline')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(failure)
    await expect(getPresentation()).rejects.toBe(failure)
  })

  it('PRE-005 propagates production JSON parsing failures', async () => {
    vi.stubEnv('DEV', false)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('bad json')
      },
    } as unknown as Response)
    await expect(getPresentation()).rejects.toThrow('bad json')
  })

  it('PRE-006 uses prototype data for non-abort development failures', async () => {
    vi.stubEnv('DEV', true)
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    await expect(getPresentation()).resolves.toMatchObject({ profile: { fullName: 'Igor Sobral' } })
  })

  it('PRE-007 never masks an aborted development request', async () => {
    vi.stubEnv('DEV', true)
    const controller = new AbortController()
    controller.abort()
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new DOMException('aborted', 'AbortError'))
    await expect(getPresentation(controller.signal)).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('PRE-008 rejects malformed successful shapes at the contract boundary', async () => {
    vi.stubEnv('DEV', false)
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => null,
    } as unknown as Response)
    await expect(getPresentation()).rejects.toMatchObject({
      name: 'ApiContractError',
      operation: 'presentation',
    })
  })
})
