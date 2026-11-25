import type { SdkConfig } from '@ai-swfactory-oss/clibind-runtime'
import type { Clock } from '@ai-swfactory-oss/clock'

interface LoggedCall {
  readonly id: string
  readonly at: string
  readonly missed: boolean
}

interface Call extends LoggedCall {
  readonly account: string
}

interface CallsPorts {
  readonly clock: Clock
}

interface CallsSdk {
  readonly calls: {
    readonly list: (data: {
      readonly account: string
      readonly since: string
      readonly limit: number
      readonly missed: boolean
    }) => Promise<readonly Call[]>
    readonly get: (data: { readonly id: string }) => Promise<Call>
  }
  readonly numbers: {
    readonly list: () => Promise<readonly string[]>
    readonly release: (data: { readonly number: string }) => Promise<void>
  }
}

export const KNOWN_CALL: LoggedCall = { id: 'call-1', at: '2026-11-01T09:00:00Z', missed: false }

const CALL_LOG: readonly LoggedCall[] = [
  KNOWN_CALL,
  { id: 'call-2', at: '2026-11-02T09:00:00Z', missed: true },
  { id: 'call-3', at: '2026-11-03T09:00:00Z', missed: true },
]

export const NUMBERS: readonly string[] = ['+15550100', '+15550101']

const accountOf = (config: SdkConfig): string => {
  const account = config.account
  if (typeof account !== 'string') throw new Error('the calls sdk config has no account')
  return account
}

export const createCallsSdk = (config: SdkConfig, options: { readonly ports: CallsPorts }): CallsSdk => {
  const account = accountOf(config)
  const { clock } = options.ports
  return {
    calls: {
      list: data =>
        Promise.resolve(
          CALL_LOG.filter(call => (!data.missed || call.missed) && call.at >= data.since)
            .slice(0, data.limit)
            .map(call => ({ ...call, account: data.account })),
        ),
      get: data => {
        const call = CALL_LOG.find(logged => logged.id === data.id)
        return call === undefined ? Promise.reject(new Error(`no call '${data.id}'`)) : Promise.resolve({ ...call, account })
      },
    },
    numbers: {
      list: () => Promise.resolve(NUMBERS),
      release: () => clock.wait(0),
    },
  }
}
