import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('an expression statement holding an assignment renders target = value', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'expression',
          expression: {
            kind: 'assign',
            target: { kind: 'member', object: { kind: 'identifier', name: 'process' }, property: 'exitCode' },
            value: {
              kind: 'await',
              expression: { kind: 'call', callee: { kind: 'identifier', name: 'main' }, arguments: [] },
            },
          },
        },
      ],
    })

    expect(source).toBe('process.exitCode = await main()\n')
  })
})
