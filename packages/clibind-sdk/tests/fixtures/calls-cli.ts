export const CALLS_CLI_TS = `import { createClibindRuntime } from '@acme/cli-runtime'
import { createOwnVersionReader } from '@acme/cli-runtime/own-version'
import { createStandardClock } from '@ai-swfactory-oss/clock/standard'
import { createNodeFiles } from '@ai-swfactory-oss/files/node'
import { createNodeTerminal } from '@ai-swfactory-oss/terminal/node'
import { createCallsSdk } from '@acme/calls-sdk'
import { fileURLToPath } from 'node:url'

import binding from './cli.binding.json' with { type: 'json' }
import opencli from './cli.opencli.json' with { type: 'json' }

process.exitCode = await createClibindRuntime({ ports: { terminal: createNodeTerminal() } }).main({
  binding: binding,
  opencli: opencli,
  version: await createOwnVersionReader({ ports: { files: createNodeFiles({ root: '/' }) } }).read({
    packageName: '@acme/calls-cli',
    fromPath: fileURLToPath(import.meta.url).slice(1),
  }),
  argv: process.argv.slice(2),
  env: process.env,
  createSdk: (config) => createCallsSdk(config, { ports: { clock: createStandardClock() } }),
})
`
