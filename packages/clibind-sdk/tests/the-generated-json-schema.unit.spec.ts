import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { bindingModelJsonSchema, PARSERS } from '../src/index'

const validBindings = (): readonly unknown[] => [
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
  { command: ['calls', 'get'], input: [{ kind: 'positional', field: 'id', type: 'string' }], output: { parser: 'json' } },
  { command: ['numbers', 'release'], input: [{ kind: 'positional', field: 'number', type: 'string' }], output: { parser: 'exit-code' } },
  ...PARSERS.map(parser => ({ command: ['status'], input: [], output: { parser } })),
]

describe('the json schema generated from the binding model', () => {
  it('the generated json schema accepts every valid binding', () => {
    const schema = z.fromJSONSchema(bindingModelJsonSchema())

    expect(validBindings().map(binding => schema.safeParse(binding).success)).toEqual(validBindings().map(() => true))
  })

  it('the generated json schema rejects a binding with an unknown parser', () => {
    const schema = z.fromJSONSchema(bindingModelJsonSchema())

    expect(schema.safeParse({ command: ['status'], input: [], output: { parser: 'yaml' } }).success).toBe(false)
  })
})
