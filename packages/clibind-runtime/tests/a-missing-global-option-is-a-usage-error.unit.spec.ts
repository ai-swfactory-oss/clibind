import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('a missing global option is a usage error', () => {
  it("a missing global option writes a usage error to the terminal's stderr, returns exit code 64 and never calls createSdk", async () => {
    const run = await runCalls(CALLS_BINDING, ['numbers', 'release', '+15550100'], {}, [])

    expect(run).toEqual({
      exitCode: 64,
      output: [{ stream: 'stderr', text: 'the global option --account is missing: pass --account or set CALLS_ACCOUNT\n' }],
      configs: [],
    })
  })
})
