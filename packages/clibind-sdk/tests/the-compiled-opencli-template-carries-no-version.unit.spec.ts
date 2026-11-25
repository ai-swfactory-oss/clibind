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
import { compiledJsonAt } from './fixtures/compiled-json'

describe('the compiled opencli template carries no version', () => {
  it('compile emits the OpenCLI template as data with no info.version', () => {
    const compiled = createClibind().compile(
      callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE),
      CALLS_BINDING_PATH,
      CALLS_SDK_PATH,
      CALLS_RUNTIME,
    )

    expect(compiledJsonAt(compiled, 'cli.opencli.json')).toEqual(expect.objectContaining({ info: { title: 'acme-calls' } }))
  })
})
