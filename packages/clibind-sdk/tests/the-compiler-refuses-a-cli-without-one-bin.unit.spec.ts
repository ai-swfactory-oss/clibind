import type { Tree } from '@ai-swfactory-oss/files'
import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import {
  CALLS_BINDING_PATH,
  CALLS_BINDING_SOURCE,
  CALLS_CLI_MANIFEST_PATH,
  CALLS_RUNTIME,
  CALLS_SDK_PATH,
  CALLS_SDK_SOURCE,
  callsCliManifest,
  callsTree,
  fixtureFile,
} from './fixtures/calls-sources'

const withoutCliManifest = (): Tree => ({
  entries: callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE).entries.filter(entry => entry.path !== CALLS_CLI_MANIFEST_PATH),
})

const withCliBin = (bin: unknown): Tree => ({
  entries: [...withoutCliManifest().entries, fixtureFile(CALLS_CLI_MANIFEST_PATH, callsCliManifest(bin))],
})

const compiled = (tree: Tree): unknown => createClibind().compile(tree, CALLS_BINDING_PATH, CALLS_SDK_PATH, CALLS_RUNTIME)

describe('the compiler refuses a cli without one bin', () => {
  it('compile refuses a binding whose nearest package.json is missing or does not declare exactly one bin, naming it', () => {
    expect([
      compiled(withoutCliManifest()),
      compiled(withCliBin({ calls: './cli.ts', phones: './phones.ts' })),
      compiled(withCliBin({})),
    ]).toEqual([
      { kind: 'refused', diagnostics: [{ path: CALLS_BINDING_PATH, message: 'the cli has no package.json at or above its binding' }] },
      {
        kind: 'refused',
        diagnostics: [{ path: CALLS_CLI_MANIFEST_PATH, message: "the cli's package.json declares 2 bins, not exactly one" }],
      },
      {
        kind: 'refused',
        diagnostics: [{ path: CALLS_CLI_MANIFEST_PATH, message: "the cli's package.json declares 0 bins, not exactly one" }],
      },
    ])
  })
})
