import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'
import { KNOWN_CALL } from './fixtures/calls-sdk'

describe('a json result is written as json text', () => {
  it("main writes a json operation's result to stdout as one line of JSON text", async () => {
    const run = await runCalls(CALLS_BINDING, ['calls', 'get', KNOWN_CALL.id], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({
      exitCode: 0,
      output: [{ stream: 'stdout', text: `${JSON.stringify({ ...KNOWN_CALL, account: 'acme' })}\n` }],
    })
  })
})
