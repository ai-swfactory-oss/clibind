import { describe, expect, it } from 'vitest'

import { argvOf, type BindingModel } from '../src/index'

type CallsField = 'account' | 'since' | 'limit' | 'missed' | 'id' | 'number'

const models: readonly BindingModel<CallsField>[] = [
  {
    command: ['calls', 'list'],
    input: [
      { kind: 'positional', field: 'account', type: 'string' },
      { kind: 'option', flag: '--since', field: 'since', type: 'string' },
      { kind: 'option', flag: '--limit', field: 'limit', type: 'number' },
      { kind: 'switch', flag: '--missed', field: 'missed' },
    ],
    output: { parser: 'json' },
  },
  {
    command: ['calls', 'get'],
    input: [{ kind: 'positional', field: 'id', type: 'string' }],
    output: { parser: 'json' },
  },
  {
    command: ['numbers', 'release'],
    input: [{ kind: 'positional', field: 'number', type: 'string' }],
    output: { parser: 'exit-code' },
  },
]

describe('the binding model maps an operation input to argv', () => {
  it('a form 1 binding with positionals, options and switches maps a typed input to the expected argv', () => {
    expect(
      models.map(model =>
        argvOf(model, { account: 'acme', since: '2026-11-01', limit: 20, missed: true, id: 'call-1', number: '+15550100' }),
      ),
    ).toEqual([
      ['calls', 'list', 'acme', '--since', '2026-11-01', '--limit', '20', '--missed'],
      ['calls', 'get', 'call-1'],
      ['numbers', 'release', '+15550100'],
    ])
    expect(
      models.map(model =>
        argvOf(model, { account: 'acme', since: '2026-11-01', limit: 5, missed: false, id: 'call-2', number: '+15550101' }),
      ),
    ).toEqual([
      ['calls', 'list', 'acme', '--since', '2026-11-01', '--limit', '5'],
      ['calls', 'get', 'call-2'],
      ['numbers', 'release', '+15550101'],
    ])
  })
})
