import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import { CALLS_CLI_BINDING_JSON, CALLS_CLI_TS } from './fixtures/calls-cli'
import { CALLS_BINDING_PATH, CALLS_BINDING_SOURCE, CALLS_SDK_PATH, CALLS_SDK_SOURCE, callsTree } from './fixtures/calls-sources'

const encoder = new TextEncoder()

const callsFixtureTree = callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE)

describe('the compiler returns the cli as outputs', () => {
  it('compiling the calls fixture tree returns outputs equal to the golden constants in tests/fixtures/calls-cli.ts', () => {
    expect(createClibind().compile(callsFixtureTree, CALLS_BINDING_PATH, CALLS_SDK_PATH)).toEqual({
      kind: 'compiled',
      outputs: {
        entries: [
          { path: 'cli.binding.json', kind: 'file', content: encoder.encode(CALLS_CLI_BINDING_JSON), executable: false },
          { path: 'cli.ts', kind: 'file', content: encoder.encode(CALLS_CLI_TS), executable: false },
        ],
      },
    })
  })

  it('the same tree compiles to the same outputs', () => {
    const clibind = createClibind()

    expect(clibind.compile(callsFixtureTree, CALLS_BINDING_PATH, CALLS_SDK_PATH)).toEqual(
      clibind.compile(callsFixtureTree, CALLS_BINDING_PATH, CALLS_SDK_PATH),
    )
  })
})
