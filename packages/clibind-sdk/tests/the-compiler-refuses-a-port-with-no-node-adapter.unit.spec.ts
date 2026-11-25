import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import {
  CALLS_BINDING_PATH,
  CALLS_BINDING_SOURCE,
  CALLS_RUNTIME,
  CALLS_SDK_PATH,
  CALLS_SDK_SOURCE,
  callsTree,
} from './fixtures/calls-sources'

const CLOCK_PORT = '  readonly clock: { readonly now: () => number }\n'

const MODEM_PORT = '  readonly modem: { readonly dial: (number: string) => Promise<void> }\n'

describe('the compiler refuses a port with no node adapter', () => {
  it('an sdk whose create declares a port with no known node adapter is refused with a diagnostic naming that port', () => {
    const tree = callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE.replace(CLOCK_PORT, `${CLOCK_PORT}${MODEM_PORT}`))

    expect(createClibind().compile(tree, CALLS_BINDING_PATH, CALLS_SDK_PATH, CALLS_RUNTIME)).toEqual({
      kind: 'refused',
      diagnostics: [{ path: CALLS_SDK_PATH, message: "the sdk's create declares the port 'modem', which has no known node adapter" }],
    })
  })
})
