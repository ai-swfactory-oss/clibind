import { describe, expect, it } from 'vitest'

import { CALLS_OPENCLI, runOpenCli } from './fixtures/calls-run'

describe('--opencli without a version exits 1', () => {
  it('--opencli with no-version writes to stderr, exits 1 and never calls createSdk', async () => {
    const run = await runOpenCli(CALLS_OPENCLI, { kind: 'no-version' })

    expect({ exitCode: run.exitCode, streams: run.output.map(write => write.stream), configs: run.configs }).toEqual({
      exitCode: 1,
      streams: ['stderr'],
      configs: [],
    })
  })
})
