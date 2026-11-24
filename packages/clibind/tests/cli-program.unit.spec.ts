import { createFakeClibind } from '@ai-swfactory-oss/clibind-sdk/testing'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'
import { describe, expect, it } from 'vitest'

import { createProgram } from '../src/cli-program'

describe('clibind compile', () => {
  it("prints the path of every file the compiler returns to the terminal's stdout", async () => {
    const terminal = createMemoryTerminal({ input: '', output: [], closed: [] })
    const clibind = createFakeClibind({
      files: [
        { path: 'cli.ts', contents: '' },
        { path: 'commands.ts', contents: '' },
      ],
    })

    await createProgram({ clibind, terminal }).parseAsync(['compile'], { from: 'user' })

    expect(terminal.state().output).toEqual([
      { stream: 'stdout', text: 'cli.ts\n' },
      { stream: 'stdout', text: 'commands.ts\n' },
    ])
  })
})
