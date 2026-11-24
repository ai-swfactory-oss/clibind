import { describe, expect, it } from 'vitest'

import { callsBinding } from './fixtures/calls-binding'
import { callsOperations } from './fixtures/calls-sdk'

describe('a Form 1 binding picks each operation by reference', () => {
  it('a Form 1 binding over the fixture sdk yields its three operations', () => {
    const selected = callsBinding.operations.map(operation => operation.select(callsOperations))

    expect(selected).toHaveLength(3)
    expect(selected[0]).toBe(callsOperations.calls.list)
    expect(selected[1]).toBe(callsOperations.calls.get)
    expect(selected[2]).toBe(callsOperations.numbers.release)
  })
})
