import { describe, expect, it } from 'vitest'

import { bind } from '../src/index'
import type { CreateCallsSdk } from './fixtures/calls-sdk'

describe('a clibind binding is written in Form 1, selector lambdas through identity helpers', () => {
  it('a Form 1 binding over three operations of the fixture sdk type-checks', () => {
    const binding = bind<ReturnType<CreateCallsSdk>>(op => [
      op(api => api.calls.list, {
        command: ['calls', 'list'],
        input: [{ kind: 'positional', field: 'account', type: 'string' }],
        output: { parser: 'json' },
      }),
      op(api => api.calls.get, {
        command: ['calls', 'get'],
        input: [{ kind: 'positional', field: 'id', type: 'string' }],
        output: { parser: 'json' },
      }),
      op(api => api.numbers.release, {
        command: ['numbers', 'release'],
        input: [{ kind: 'positional', field: 'number', type: 'string' }],
        output: { parser: 'exit-code' },
      }),
    ])

    expect(binding.operations.map(operation => operation.model.command)).toEqual([
      ['calls', 'list'],
      ['calls', 'get'],
      ['numbers', 'release'],
    ])
  })
})
