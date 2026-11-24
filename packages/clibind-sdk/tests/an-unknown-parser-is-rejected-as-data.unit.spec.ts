import { describe, expect, it } from 'vitest'

import { parseBindingModel } from '../src/index'

const modelWithParser = (parser: string): unknown => ({
  command: ['calls', 'list'],
  input: [{ kind: 'positional', field: 'account', type: 'string' }],
  output: { parser },
})

describe('the output parser is one of a closed built-in set', () => {
  it('a binding naming a parser outside the built-in set is rejected as data', () => {
    const rejected = parseBindingModel(modelWithParser('yaml'))

    expect(rejected.success).toBe(false)
    expect(rejected.success ? [] : rejected.issues.map(issue => issue.path)).toEqual([['output', 'parser']])
    expect(parseBindingModel(modelWithParser('lines'))).toEqual({
      success: true,
      model: modelWithParser('lines'),
    })
  })
})
