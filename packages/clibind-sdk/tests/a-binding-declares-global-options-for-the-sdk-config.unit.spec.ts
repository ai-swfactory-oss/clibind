import { describe, expect, it } from 'vitest'

import { bind } from '../src/index'

interface CallsConfig {
  readonly account: string
  readonly timeout: number
}

interface CallsSdk {
  readonly calls: {
    readonly get: (data: { readonly id: string }) => Promise<string>
  }
}

describe('a binding declares global options for the sdk config', () => {
  it('a binding declares one global option per sdk config field, each with a required flag, env variable, config field and type', () => {
    const binding = bind<CallsSdk, CallsConfig>(
      {
        create: 'createCallsSdk',
        globals: {
          account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },
          timeout: { flag: '--timeout', env: 'CALLS_TIMEOUT', field: 'timeout', type: 'number' },
        },
      },
      op => [
        op(api => api.calls.get, {
          command: ['calls', 'get'],
          input: [{ kind: 'positional', field: 'id', type: 'string' }],
          output: { parser: 'json' },
        }),
      ],
    )

    expect(binding.sdk.globals).toEqual({
      account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },
      timeout: { flag: '--timeout', env: 'CALLS_TIMEOUT', field: 'timeout', type: 'number' },
    })
  })
})
