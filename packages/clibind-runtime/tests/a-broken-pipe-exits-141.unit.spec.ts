import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'
import { KNOWN_CALL } from './fixtures/calls-sdk'

describe('a broken pipe exits 141', () => {
  it('a broken pipe exits with 141', async () => {
    const run = await runCalls(CALLS_BINDING, ['calls', 'get', KNOWN_CALL.id], { CALLS_ACCOUNT: 'acme' }, ['stdout'])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({ exitCode: 141, output: [] })
  })
})
