import { createMemoryClock } from '@ai-swfactory-oss/clock/memory'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'
import { describe, expect, it } from 'vitest'

import { createClibindRuntime } from '../src/index'
import { CALLS_BINDING } from './fixtures/calls-binding'
import { CALLS_OPENCLI, CALLS_VERSION } from './fixtures/calls-run'
import { createCallsSdk, KNOWN_CALL } from './fixtures/calls-sdk'

describe('main runs a binding and returns the exit code', () => {
  it('createClibindRuntime given the terminal port returns a main that, given a binding, argv, env and createSdk, resolves to the exit code', async () => {
    const clock = createMemoryClock({ now: 0 })
    const runtime = createClibindRuntime({ ports: { terminal: createMemoryTerminal({ input: '', output: [], closed: [] }) } })

    const exitCode = await runtime.main({
      binding: CALLS_BINDING,
      opencli: CALLS_OPENCLI,
      version: CALLS_VERSION,
      argv: ['numbers', 'release', '+15550100'],
      env: { CALLS_ACCOUNT: 'acme' },
      createSdk: config => createCallsSdk(config, { ports: { clock } }),
    })
    const failedCode = await runtime.main({
      binding: CALLS_BINDING,
      opencli: CALLS_OPENCLI,
      version: CALLS_VERSION,
      argv: ['calls', 'get', `${KNOWN_CALL.id}-unknown`],
      env: { CALLS_ACCOUNT: 'acme' },
      createSdk: config => createCallsSdk(config, { ports: { clock } }),
    })

    expect({ exitCode, failedCode }).toEqual({ exitCode: 0, failedCode: 1 })
  })
})
