import { createMemoryClock } from '@ai-swfactory-oss/clock/memory'
import type { TerminalStream, TerminalWrite } from '@ai-swfactory-oss/terminal'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'

import { createClibindRuntime, type Env, type OwnVersion, type SdkConfig } from '@/index'

import { CALLS_BINDING } from './calls-binding'
import callsCliOpenCli from './calls-cli.opencli.json' with { type: 'json' }
import { createCallsSdk } from './calls-sdk'

export const CALLS_OPENCLI: unknown = callsCliOpenCli

export const CALLS_VERSION: OwnVersion = { kind: 'found', version: '1.2.3' }

export interface CallsRun {
  readonly exitCode: number
  readonly output: readonly TerminalWrite[]
  readonly configs: readonly SdkConfig[]
}

interface CallsMain {
  readonly binding: unknown
  readonly opencli: unknown
  readonly version: OwnVersion
  readonly argv: readonly string[]
  readonly env: Env
  readonly closed: readonly TerminalStream[]
}

const runMain = async (input: CallsMain): Promise<CallsRun> => {
  const terminal = createMemoryTerminal({ input: '', output: [], closed: input.closed })
  const clock = createMemoryClock({ now: 0 })
  const configs: SdkConfig[] = []
  const exitCode = await createClibindRuntime({ ports: { terminal } }).main({
    binding: input.binding,
    opencli: input.opencli,
    version: input.version,
    argv: input.argv,
    env: input.env,
    createSdk: config => {
      configs.push(config)
      return createCallsSdk(config, { ports: { clock } })
    },
  })
  return { exitCode, output: terminal.state().output, configs }
}

export const runCalls = (binding: unknown, argv: readonly string[], env: Env, closed: readonly TerminalStream[]): Promise<CallsRun> =>
  runMain({ binding, opencli: CALLS_OPENCLI, version: CALLS_VERSION, argv, env, closed })

export const runOpenCli = (opencli: unknown, version: OwnVersion): Promise<CallsRun> =>
  runMain({ binding: CALLS_BINDING, opencli, version, argv: ['--opencli'], env: { CALLS_ACCOUNT: 'acme' }, closed: [] })
