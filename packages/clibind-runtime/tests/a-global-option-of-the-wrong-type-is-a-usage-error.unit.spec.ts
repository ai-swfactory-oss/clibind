import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('a global option of the wrong type is a usage error', () => {
  it('a number global option whose value is not a number writes a usage error to stderr, exits 64 and never calls createSdk', async () => {
    const binding = {
      ...CALLS_BINDING,
      globals: [...CALLS_BINDING.globals, { flag: '--timeout', env: 'CALLS_TIMEOUT', field: 'timeout', type: 'number' }],
    }

    const run = await runCalls(binding, ['numbers', 'list'], { CALLS_ACCOUNT: 'acme', CALLS_TIMEOUT: 'soon' }, [])

    expect(run).toEqual({
      exitCode: 64,
      output: [{ stream: 'stderr', text: "the global option --timeout takes a number, not 'soon'\n" }],
      configs: [],
    })
  })
})
