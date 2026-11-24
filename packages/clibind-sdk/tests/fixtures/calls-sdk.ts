interface Call {
  readonly id: string
  readonly from: string
}

interface CallsConfig {
  readonly account: string
}

interface CallsPorts {
  readonly clock: { readonly now: () => number }
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
    readonly release: (data: { readonly number: string }) => Promise<void>
  }
}

export type CreateCallsSdk = (data: CallsConfig, options: { readonly ports: CallsPorts }) => CallsSdk

const CALL: Call = { id: 'call-1', from: '+15550100' }

export const callsOperations: ReturnType<CreateCallsSdk> = {
  calls: {
    list: () => Promise.resolve([CALL]),
    get: () => Promise.resolve(CALL),
  },
  numbers: {
    release: () => Promise.resolve(),
  },
}
