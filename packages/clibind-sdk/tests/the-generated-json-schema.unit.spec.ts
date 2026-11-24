import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { bindingModelJsonSchema, PARSERS } from '../src/index'
import { callsBinding } from './fixtures/calls-binding'

const validBindings = (): readonly unknown[] => [
  ...callsBinding.operations.map(operation => operation.model),
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
