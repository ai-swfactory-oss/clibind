import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import { CALLS_BINDING_PATH, CALLS_BINDING_SOURCE, CALLS_SDK_PATH, CALLS_SDK_SOURCE, callsTree } from './fixtures/calls-sources'

const compiledNaming = (create: string): unknown =>
  createClibind().compile(
    callsTree(CALLS_BINDING_SOURCE.replace("{ create: 'createCallsSdk' }", `{ create: '${create}' }`), CALLS_SDK_SOURCE),
    CALLS_BINDING_PATH,
    CALLS_SDK_PATH,
  )

describe('the compiler refuses a missing create export', () => {
  it('a binding whose sdk.create names an export the sdk lacks, or one that is not a create function, is refused with a diagnostic naming that export', () => {
    expect([compiledNaming('createPhonesSdk'), compiledNaming('callsSdkVersion')]).toEqual([
      { kind: 'refused', diagnostics: [{ path: CALLS_SDK_PATH, message: "the sdk has no export named 'createPhonesSdk'" }] },
      {
        kind: 'refused',
        diagnostics: [{ path: CALLS_SDK_PATH, message: "the sdk's export 'callsSdkVersion' is not a create function taking { ports }" }],
      },
    ])
  })
})
