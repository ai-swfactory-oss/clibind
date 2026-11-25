import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

const lines = (...text: readonly string[]): string => `${text.join('\n')}\n`

describe('renderTypeScriptSource', () => {
  it('an if statement renders its then block, and an else block only when otherwise is else', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'function',
          name: 'check',
          parameters: [{ name: 'value' }],
          body: [
            {
              kind: 'if',
              condition: { kind: 'identifier', name: 'ready' },
              then: [{ kind: 'return', value: { kind: 'identifier', name: 'value' } }],
              otherwise: { kind: 'else', statements: [{ kind: 'return', value: { kind: 'data', value: null } }] },
            },
            {
              kind: 'if',
              condition: { kind: 'identifier', name: 'done' },
              then: [{ kind: 'return' }],
              otherwise: { kind: 'none' },
            },
          ],
        },
      ],
    })

    expect(source).toBe(
      lines(
        'function check(value) {',
        '  if (ready) {',
        '    return value',
        '  } else {',
        '    return null',
        '  }',
        '  if (done) {',
        '    return',
        '  }',
        '}',
      ),
    )
  })
})
