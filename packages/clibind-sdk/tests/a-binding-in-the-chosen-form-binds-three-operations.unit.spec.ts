import { describe, expect, it } from 'vitest'

import { bind } from '../src/index'

interface Call {
  readonly id: string
}

const callsApi = {
  calls: {
    list: (data: { readonly account: string }): Promise<readonly Call[]> => Promise.resolve([{ id: data.account }]),
    get: (data: { readonly id: string }): Promise<Call> => Promise.resolve({ id: data.id }),
  },
  numbers: {
    release: (data: { readonly number: string }): Promise<string> => Promise.resolve(data.number),
  },
}

describe('a Form 1 binding picks each operation by reference', () => {
  it('a Form 1 binding over the fixture sdk yields its three operations', () => {
    const binding = bind<typeof callsApi, { readonly account: string }>(
      { create: 'createCallsSdk', globals: { account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' } } },
      op => [
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
      ],
    )

    const selected = binding.operations.map(operation => operation.select(callsApi))

    expect(selected).toHaveLength(3)
    expect(selected[0]).toBe(callsApi.calls.list)
    expect(selected[1]).toBe(callsApi.calls.get)
    expect(selected[2]).toBe(callsApi.numbers.release)
  })
})
