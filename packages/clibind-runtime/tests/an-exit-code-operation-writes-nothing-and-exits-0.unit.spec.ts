import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('an exit-code operation writes nothing and exits 0', () => {
  it('an exit-code operation that resolves writes nothing to stdout and exits 0', async () => {
    const run = await runCalls(CALLS_BINDING, ['numbers', 'release', '+15550100'], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({ exitCode: 0, output: [] })
  })
})
