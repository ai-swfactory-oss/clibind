import { describe, expect, it } from 'vitest'

import { argvOf } from '../src/index'
import { callsBinding } from './fixtures/calls-binding'

describe('the binding model maps an operation input to argv', () => {
  it('a form 1 binding with positionals, options and switches maps a typed input to the expected argv', () => {
    const models = callsBinding.operations.map(operation => operation.model)

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
