export const CALLS_CLI_TS = `import { createClibindRuntime } from '@acme/cli-runtime'
import { createStandardClock } from '@ai-swfactory-oss/clock/standard'
import { createNodeTerminal } from '@ai-swfactory-oss/terminal/node'
import { createCallsSdk } from '@acme/calls-sdk'

import binding from './cli.binding.json' with { type: 'json' }

process.exitCode = await createClibindRuntime({ ports: { terminal: createNodeTerminal() } }).main({
  binding: binding,
  argv: process.argv.slice(2),
  env: process.env,
  createSdk: (config) => createCallsSdk(config, { ports: { clock: createStandardClock() } }),
})
`
