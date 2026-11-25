import { describe, expect, it } from 'vitest'

import { runCalls } from './fixtures/calls-run'

describe('an invalid binding exits 1', () => {
  it('main given a binding that is not a compiled cli.binding.json writes to stderr, exits 1 and never calls createSdk', async () => {
    const run = await runCalls({ operations: [] }, ['numbers', 'list'], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, streams: run.output.map(write => write.stream), configs: run.configs }).toEqual({
      exitCode: 1,
      streams: ['stderr'],
      configs: [],
    })
  })
})
