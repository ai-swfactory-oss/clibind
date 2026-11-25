import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('a binary expression renders its left operand, operator and right operand, parenthesizing a nested binary operand', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'both',
          value: {
            kind: 'binary',
            operator: '&&',
            left: {
              kind: 'binary',
              operator: '===',
              left: { kind: 'identifier', name: 'a' },
              right: { kind: 'identifier', name: 'b' },
            },
            right: {
              kind: 'binary',
              operator: '!==',
              left: { kind: 'identifier', name: 'c' },
              right: { kind: 'identifier', name: 'd' },
            },
          },
        },
      ],
    })

    expect(source).toBe('const both = (a === b) && (c !== d)\n')
  })
})
