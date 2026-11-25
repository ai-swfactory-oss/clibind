import { describe, expect, it } from 'vitest'

import { bindingWith } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'
import { KNOWN_CALL } from './fixtures/calls-sdk'

describe('a lines result that is not strings fails', () => {
  it('a lines operation whose result is not a list of strings writes to stderr and exits 1', async () => {
    const binding = bindingWith([
      {
        operation: ['calls', 'get'],
        command: ['calls', 'get'],
        input: [{ kind: 'positional', field: 'id', type: 'string' }],
        output: { parser: 'lines' },
      },
    ])

    const run = await runCalls(binding, ['calls', 'get', KNOWN_CALL.id], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({
      exitCode: 1,
      output: [{ stream: 'stderr', text: 'the lines result is not a list of strings\n' }],
    })
  })
})
