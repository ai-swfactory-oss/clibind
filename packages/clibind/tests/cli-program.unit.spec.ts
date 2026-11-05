import { createFakeClibind } from '@ai-swfactory-oss/clibind-sdk/testing'
import { describe, expect, it } from 'vitest'

import { createProgram } from '../src/cli-program'

describe('clibind compile', () => {
  it('prints the path of every file the compiler returns', async () => {
    const written: string[] = []
    const clibind = createFakeClibind({
      files: [
        { path: 'cli.ts', contents: '' },
        { path: 'commands.ts', contents: '' },
      ],
    })

    await createProgram({ clibind, write: text => written.push(text) }).parseAsync(['compile'], { from: 'user' })

    expect(written).toEqual(['cli.ts\n', 'commands.ts\n'])
  })
})
