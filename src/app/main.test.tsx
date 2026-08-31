import { beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ render: vi.fn(), createRoot: vi.fn() }))

vi.mock('react-dom/client', () => ({
  createRoot: mocks.createRoot.mockReturnValue({ render: mocks.render }),
}))

beforeEach(() => {
  vi.resetModules()
  mocks.render.mockClear()
  mocks.createRoot.mockClear()
  document.body.innerHTML = '<div id="root"></div>'
})

it('COV-005 bootstraps the application into the root provider tree', async () => {
  await import('./main')
  expect(mocks.createRoot).toHaveBeenCalledWith(document.getElementById('root'))
  expect(mocks.render).toHaveBeenCalledOnce()
  const tree = mocks.render.mock.calls[0][0]
  expect(tree.type).toBeDefined()
  expect(tree.props.children).toBeDefined()
})
