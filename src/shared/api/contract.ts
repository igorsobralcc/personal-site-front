import { z } from 'zod'

export class ApiContractError extends Error {
  readonly operation: string
  readonly issues: readonly string[]

  constructor(operation: string, issues: readonly z.core.$ZodIssue[]) {
    super(`The ${operation} response did not match its contract`)
    this.name = 'ApiContractError'
    this.operation = operation
    this.issues = issues.map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '<root>'
      return `${path}: ${issue.message}`
    })
  }
}

export function parseContract<T>(schema: z.ZodType<T>, value: unknown, operation: string): T {
  const result = schema.safeParse(value)
  if (!result.success) throw new ApiContractError(operation, result.error.issues)
  return result.data
}
