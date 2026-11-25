import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

describe('main builds the config from the global options', () => {
  it("main builds the config from each global option's argv flag, falling back to its env variable, validates it, then calls createSdk with it", async () => {
    const fromArgv = await runCalls(
      CALLS_BINDING,
      ['numbers', 'release', '--account', 'from-argv', '+15550100'],
      { CALLS_ACCOUNT: 'from-env' },
      [],
    )
    const fromEnv = await runCalls(CALLS_BINDING, ['numbers', 'release', '+15550100'], { CALLS_ACCOUNT: 'from-env' }, [])

    expect([fromArgv, fromEnv].map(run => ({ exitCode: run.exitCode, configs: run.configs }))).toEqual([
      { exitCode: 0, configs: [{ account: 'from-argv' }] },
      { exitCode: 0, configs: [{ account: 'from-env' }] },
    ])
  })
})
