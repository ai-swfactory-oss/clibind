import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import { createFakeClibind } from '../src/testing/index'

describe('createClibind', () => {
  it('compiles to no files while the compiler is a skeleton', () => {
    expect(createClibind().compile()).toEqual({ files: [] })
  })
})

describe('createFakeClibind', () => {
  it('returns no files by default', () => {
    expect(createFakeClibind().compile()).toEqual({ files: [] })
  })

  it('returns the result it was given', () => {
    const result = { files: [{ path: 'cli.ts', contents: 'export {}\n' }] }
    expect(createFakeClibind(result).compile()).toBe(result)
  })
})
