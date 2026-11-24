import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('an import declaration with attributes renders a with clause after the module specifier, and one without attributes renders none', () => {
    const source = renderTypeScriptSource({
      imports: [
        [
          {
            from: './cli.binding.json',
            default: { kind: 'default', name: 'binding' },
            names: [],
            attributes: [{ key: 'type', value: 'json' }],
          },
          { from: './plain', default: { kind: 'default', name: 'plain' }, names: [], attributes: [] },
        ],
      ],
    })

    expect(source).toBe("import binding from './cli.binding.json' with { type: 'json' }\nimport plain from './plain'\n")
  })
})
