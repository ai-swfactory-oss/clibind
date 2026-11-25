import { describe, expect, it } from 'vitest'

import { bindingWith } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('a porcelain-v2 output is not supported', () => {
  it('a porcelain-v2 operation writes an unsupported-output message to stderr, exits 1 and never calls createSdk', async () => {
    const binding = bindingWith([
      { operation: ['numbers', 'list'], command: ['numbers', 'list'], input: [], output: { parser: 'porcelain-v2' } },
    ])

    const run = await runCalls(binding, ['numbers', 'list'], { CALLS_ACCOUNT: 'acme' }, [])

    expect(run).toEqual({
      exitCode: 1,
      output: [{ stream: 'stderr', text: "the output form 'porcelain-v2' is not supported\n" }],
      configs: [],
    })
  })
})
