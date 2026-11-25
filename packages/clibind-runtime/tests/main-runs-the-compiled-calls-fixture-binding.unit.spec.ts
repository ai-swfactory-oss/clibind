import { createMemoryClock } from '@ai-swfactory-oss/clock/memory'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'
import { describe, expect, it } from 'vitest'

import { createClibindRuntime } from '../src/index'
import callsCliBinding from './fixtures/calls-cli.binding.json' with { type: 'json' }
import { CALLS_OPENCLI, CALLS_VERSION } from './fixtures/calls-run'
import { createCallsSdk, KNOWN_CALL } from './fixtures/calls-sdk'

describe('main runs the compiled calls fixture binding', () => {
  it('main runs the compiled calls fixture binding on memory adapters', async () => {
    const terminal = createMemoryTerminal({ input: '', output: [], closed: [] })
    const clock = createMemoryClock({ now: 0 })

    const exitCode = await createClibindRuntime({ ports: { terminal } }).main({
      binding: callsCliBinding,
      opencli: CALLS_OPENCLI,
      version: CALLS_VERSION,
      argv: ['calls', 'get', KNOWN_CALL.id, '--account', 'acme'],
      env: {},
      createSdk: config => createCallsSdk(config, { ports: { clock } }),
    })

    expect({ exitCode, output: terminal.state().output }).toEqual({
      exitCode: 0,
      output: [{ stream: 'stdout', text: `${JSON.stringify({ ...KNOWN_CALL, account: 'acme' })}\n` }],
    })
  })
})
