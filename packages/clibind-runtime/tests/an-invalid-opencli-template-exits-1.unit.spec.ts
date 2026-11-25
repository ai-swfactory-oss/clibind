import { describe, expect, it } from 'vitest'

import { CALLS_VERSION, runOpenCli } from './fixtures/calls-run'

describe('an invalid opencli template exits 1', () => {
  it('--opencli given a template that is not a compiled OpenCLI template writes to stderr and exits 1', async () => {
    const run = await runOpenCli({ opencli: '0.1', info: { title: 'acme-calls', version: '1.0.0' } }, CALLS_VERSION)

    expect({ exitCode: run.exitCode, streams: run.output.map(write => write.stream), configs: run.configs }).toEqual({
      exitCode: 1,
      streams: ['stderr'],
      configs: [],
    })
  })
})
