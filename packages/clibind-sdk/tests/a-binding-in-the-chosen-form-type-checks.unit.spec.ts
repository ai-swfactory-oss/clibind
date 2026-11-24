import { describe, expect, it } from 'vitest'

import { bind } from '../src/index'
import type { CreateCallsSdk } from './fixtures/calls-sdk'

describe('a clibind binding is written in Form 1, selector lambdas through identity helpers', () => {
  it('a Form 1 binding over three operations of the fixture sdk type-checks', () => {
    const binding = bind<ReturnType<CreateCallsSdk>>(op => [
      op(api => api.calls.list, ['calls', 'list']),
      op(api => api.calls.get, ['calls', 'get']),
      op(api => api.numbers.release, ['numbers', 'release']),
    ])

    expect(binding.operations.map(operation => operation.command)).toEqual([
      ['calls', 'list'],
      ['calls', 'get'],
      ['numbers', 'release'],
    ])
  })
})
