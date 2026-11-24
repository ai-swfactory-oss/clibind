import { describe, expect, it } from 'vitest'

import type { CompileResult } from '../src/index'
import { createFakeClibind } from '../src/testing/index'

describe('createFakeClibind', () => {
  it('returns no outputs by default', () => {
    expect(createFakeClibind().compile({ entries: [] }, 'binding.ts', 'sdk.ts')).toEqual({ kind: 'compiled', outputs: { entries: [] } })
  })

  it('returns the result it was given', () => {
    const result: CompileResult = { kind: 'refused', diagnostics: [{ path: 'sdk.ts', message: 'refused' }] }
    expect(createFakeClibind(result).compile({ entries: [] }, 'binding.ts', 'sdk.ts')).toBe(result)
  })
})
