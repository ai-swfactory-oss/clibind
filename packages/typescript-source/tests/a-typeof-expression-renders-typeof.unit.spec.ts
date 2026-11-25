import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('a typeof expression renders as typeof followed by its operand', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'kind',
          value: { kind: 'typeof', operand: { kind: 'identifier', name: 'value' } },
        },
      ],
    })

    expect(source).toBe('const kind = typeof value\n')
  })
})
