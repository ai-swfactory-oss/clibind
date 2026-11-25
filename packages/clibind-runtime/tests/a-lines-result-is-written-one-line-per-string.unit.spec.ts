import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'
import { NUMBERS } from './fixtures/calls-sdk'

describe('a lines result is written one line per string', () => {
  it("main writes a lines operation's result to stdout as one line per string", async () => {
    const run = await runCalls(CALLS_BINDING, ['numbers', 'list'], { CALLS_ACCOUNT: 'acme' }, [])

    expect({ exitCode: run.exitCode, output: run.output }).toEqual({
      exitCode: 0,
      output: [{ stream: 'stdout', text: NUMBERS.map(number => `${number}\n`).join('') }],
    })
  })
})
