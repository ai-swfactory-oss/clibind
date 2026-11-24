import { describe, expect, it } from 'vitest'

import { bind, type GlobalOptions } from '../src/index'

interface CallsConfig {
  readonly account: string
}

const CALLS_GLOBALS: GlobalOptions<CallsConfig> = {
  account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },
}

interface Call {
  readonly id: string
  readonly from: string
}

interface CallsSdk {
  readonly calls: {
    readonly list: (data: { readonly account: string }) => Promise<readonly Call[]>
    readonly get: (data: { readonly id: string }) => Promise<Call>
  }
  readonly numbers: {
    readonly release: (data: { readonly number: string }) => Promise<void>
  }
}

describe('a clibind binding is written in Form 1, selector lambdas through identity helpers', () => {
  it('a Form 1 binding over three operations of the fixture sdk type-checks', () => {
    const binding = bind<CallsSdk, CallsConfig>({ create: 'createCallsSdk', globals: CALLS_GLOBALS }, op => [
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
