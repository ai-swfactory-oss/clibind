import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import { CALLS_BINDING_PATH, CALLS_BINDING_SOURCE, CALLS_SDK_PATH, CALLS_SDK_SOURCE, callsTree } from './fixtures/calls-sources'

const decoder = new TextDecoder()

const cliTsImportingFrom = (module: string): string | undefined => {
  const result = createClibind().compile(callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE), CALLS_BINDING_PATH, CALLS_SDK_PATH, { module })
  const cliTs = result.kind === 'compiled' ? result.outputs.entries.find(entry => entry.path === 'cli.ts') : undefined
  return cliTs?.kind === 'file' ? decoder.decode(cliTs.content).split('\n')[0] : undefined
}

describe('the compiler names the runtime module it is given', () => {
  it('the generated cli.ts imports createClibindRuntime from the runtime module compile is given', () => {
    expect([cliTsImportingFrom('@acme/cli-runtime'), cliTsImportingFrom('@other/runtime')]).toEqual([
      "import { createClibindRuntime } from '@acme/cli-runtime'",
      "import { createClibindRuntime } from '@other/runtime'",
    ])
  })
})
