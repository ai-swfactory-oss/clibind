import { createMemoryClock } from '@ai-swfactory-oss/clock/memory'
import type { TerminalStream, TerminalWrite } from '@ai-swfactory-oss/terminal'
import { createMemoryTerminal } from '@ai-swfactory-oss/terminal/memory'

import { createClibindRuntime, type Env, type SdkConfig } from '@/index'

import { createCallsSdk } from './calls-sdk'

export interface CallsRun {
  readonly exitCode: number
  readonly output: readonly TerminalWrite[]
  readonly configs: readonly SdkConfig[]
}

export const runCalls = async (
  binding: unknown,
  argv: readonly string[],
  env: Env,
  closed: readonly TerminalStream[],
): Promise<CallsRun> => {
  const terminal = createMemoryTerminal({ input: '', output: [], closed })
  const clock = createMemoryClock({ now: 0 })
  const configs: SdkConfig[] = []
  const exitCode = await createClibindRuntime({ ports: { terminal } }).main({
    binding,
    argv,
    env,
    createSdk: config => {
      configs.push(config)
      return createCallsSdk(config, { ports: { clock } })
    },
  })
  return { exitCode, output: terminal.state().output, configs }
}
