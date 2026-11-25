import { describe, expect, it } from 'vitest'

import callsCliOpenCli from './fixtures/calls-cli.opencli.json' with { type: 'json' }
import { CALLS_OPENCLI, runOpenCli } from './fixtures/calls-run'

describe('--opencli prints the document and exits 0', () => {
  it('--opencli writes the OpenCLI document for the template and found version to stdout as JSON, exits 0 and never calls createSdk', async () => {
    const run = await runOpenCli(CALLS_OPENCLI, { kind: 'found', version: '7.8.9' })

    const document = { opencli: '0.1', info: { title: 'acme-calls', version: '7.8.9' }, command: callsCliOpenCli.command }
    expect(run).toEqual({ exitCode: 0, output: [{ stream: 'stdout', text: `${JSON.stringify(document, null, 2)}\n` }], configs: [] })
  })
})
