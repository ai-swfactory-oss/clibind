import { createClibind } from '@ai-swfactory-oss/clibind-sdk'
import type { TreeEntryJson } from '@ai-swfactory-oss/files'
import { createMemoryFiles, type MemoryFiles } from '@ai-swfactory-oss/files/memory'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'
import { describe, expect, it } from 'vitest'

import { runCli } from '../src/cli-program'

const BINDING_SOURCE = `import { bind } from '@ai-swfactory-oss/clibind-sdk'
import type { CreateClockSdk } from '@acme/clock-sdk'

export const clockBinding = bind<ReturnType<CreateClockSdk>, Parameters<CreateClockSdk>[0]>({ create: 'createClockSdk', globals: {} }, op => [
  op(api => api.time.now, { command: ['now'], input: [], output: { parser: 'lines' } }),
])
`

const SDK_SOURCE = `interface ClockPorts {
  readonly clock: { readonly now: () => number }
}

interface ClockSdk {
  readonly time: { readonly now: (data: Record<string, never>) => Promise<string> }
}

export type CreateClockSdk = (data: Record<string, never>, options: { readonly ports: ClockPorts }) => ClockSdk

export declare const createClockSdk: CreateClockSdk
`

const file = (path: string, text: string): TreeEntryJson => ({ path, kind: 'file', content: btoa(text), executable: false })

const memoryFiles = (entries: readonly TreeEntryJson[]): MemoryFiles => {
  const created = createMemoryFiles({ entries })
  if (created.kind !== 'files') throw new Error(`the memory files adapter refused the tree: ${created.kind}`)
  return created.files
}

describe('clibind compile prints the output paths', () => {
  it('clibind compile prints the path of every output the compiler returns for the binding and sdk it names', async () => {
    const terminal = createMemoryTerminal({ input: '', output: [], closed: [] })
    const files = memoryFiles([
      file('clock-cli/package.json', JSON.stringify({ name: '@acme/clock-cli', bin: { clock: './cli.ts' } })),
      file('clock-cli/binding.ts', BINDING_SOURCE),
      file('clock-sdk/package.json', JSON.stringify({ name: '@acme/clock-sdk' })),
      file('clock-sdk/src/index.ts', SDK_SOURCE),
    ])

    const exitCode = await runCli({ clibind: createClibind(), files, terminal }, [
      'compile',
      './clock-cli/binding.ts',
      'clock-sdk/src/index.ts',
    ])

    expect({ exitCode, output: terminal.state().output }).toEqual({
      exitCode: 0,
      output: [
        { stream: 'stdout', text: 'cli.binding.json\n' },
        { stream: 'stdout', text: 'cli.opencli.json\n' },
        { stream: 'stdout', text: 'cli.ts\n' },
      ],
    })
  })
})
