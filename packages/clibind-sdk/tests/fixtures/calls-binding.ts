import { bind, type Binding } from '@/index'

import type { CreateCallsSdk } from './calls-sdk'

export const callsBinding: Binding<ReturnType<CreateCallsSdk>> = bind<ReturnType<CreateCallsSdk>>(op => [
  op(api => api.calls.list, {
    command: ['calls', 'list'],
    input: [
      { kind: 'positional', field: 'account', type: 'string' },
      { kind: 'option', flag: '--since', field: 'since', type: 'string' },
      { kind: 'option', flag: '--limit', field: 'limit', type: 'number' },
      { kind: 'switch', flag: '--missed', field: 'missed' },
    ],
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
