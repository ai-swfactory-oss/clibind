import { describe, expect, it } from 'vitest'

import { renderTypeScriptSource } from '../src/index'

describe('renderTypeScriptSource', () => {
  it('an import declaration with a default import renders import name from the module', () => {
    const source = renderTypeScriptSource({
      imports: [
        [
          { from: './binding', default: { kind: 'default', name: 'binding' }, names: [], attributes: [] },
          { from: 'commander', default: { kind: 'default', name: 'commander' }, names: [{ name: 'Command' }], attributes: [] },
        ],
      ],
    })

    expect(source).toBe("import binding from './binding'\nimport commander, { Command } from 'commander'\n")
  })
})
