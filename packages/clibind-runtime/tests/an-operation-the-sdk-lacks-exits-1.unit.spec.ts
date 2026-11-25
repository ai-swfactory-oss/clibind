import { describe, expect, it } from 'vitest'

import { bindingWith } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('an operation the sdk lacks exits 1', () => {
  it('an operation path the sdk does not provide writes to stderr and exits 1', async () => {
    const binding = bindingWith([
      { operation: ['numbers', 'port'], command: ['numbers', 'port'], input: [], output: { parser: 'exit-code' } },
    ])

    const run = await runCalls(binding, ['numbers', 'port'], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({
      exitCode: 1,
      output: [{ stream: 'stderr', text: 'the sdk has no operation numbers.port\n' }],
    })
  })
})
