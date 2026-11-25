import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('a conditional expression renders as condition ? whenTrue : whenFalse', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'port',
          value: {
            kind: 'conditional',
            condition: { kind: 'identifier', name: 'ready' },
            whenTrue: { kind: 'identifier', name: 'open' },
            whenFalse: { kind: 'identifier', name: 'closed' },
          },
        },
      ],
    })

    expect(source).toBe('const port = ready ? open : closed\n')
  })
})
