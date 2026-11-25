import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('an unknown command is a usage error', () => {
  it('an argv that matches no bound command writes a usage error to stderr, exits 64 and never calls createSdk', async () => {
    const run = await runCalls(CALLS_BINDING, ['calls', 'delete', 'call-1'], { CALLS_ACCOUNT: 'acme' }, [])

    expect(run).toEqual({
      exitCode: 64,
      output: [{ stream: 'stderr', text: "no command matches 'calls delete call-1'\n" }],
      configs: [],
    })
  })
})
