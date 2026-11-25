import type { FileEntry, Tree } from '@ai-swfactory-oss/files'

export const CALLS_BINDING_PATH = 'calls-cli/binding.ts'

export const CALLS_SDK_PATH = 'calls-sdk/src/index.ts'

export const CALLS_RUNTIME = { module: '@acme/cli-runtime' }

const CALLS_SDK_MANIFEST_PATH = 'calls-sdk/package.json'

const CALLS_SDK_MANIFEST = `${JSON.stringify({ name: '@acme/calls-sdk', type: 'module' }, null, 2)}\n`

export const CALLS_CLI_MANIFEST_PATH = 'calls-cli/package.json'

export const callsCliManifest = (bin: unknown): string => `${JSON.stringify({ name: '@acme/calls-cli', type: 'module', bin }, null, 2)}\n`

export const CALLS_CLI_BIN = 'acme-calls'

const CALLS_CLI_MANIFEST = callsCliManifest({ [CALLS_CLI_BIN]: './cli.ts' })

export const CALLS_BINDING_SOURCE = `import { bind } from '@ai-swfactory-oss/clibind-sdk'
import type { CreateCallsSdk } from '@acme/calls-sdk'

export const callsBinding = bind<ReturnType<CreateCallsSdk>, Parameters<CreateCallsSdk>[0]>({
  create: 'createCallsSdk',
  globals: {
    account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },
  },
}, op => [
  op(api => api.calls.list, {
    command: ['calls', 'list'],
    input: [
      { kind: 'positional', field: 'account', type: 'string' },
      { kind: 'option', flag: '--since', field: 'since', type: 'string' },
      { kind: 'option', flag: '--limit', field: 'limit', type: 'number' },
      { kind: 'switch', flag: '--missed', field: 'missed' },
    ],
    output: { parser: 'json' },
  }),
  op(api => api.calls.get, {
    command: ['calls', 'get'],
    input: [{ kind: 'positional', field: 'id', type: 'string' }],
    output: { parser: 'json' },
  }),
  op(api => api.numbers.release, {
    command: ['numbers', 'release'],
    input: [{ kind: 'positional', field: 'number', type: 'string' }],
    output: { parser: 'exit-code' },
  }),
])
`

export const CALLS_SDK_SOURCE = `interface Call {
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

export declare const createCallsSdk: CreateCallsSdk

export declare const callsSdkVersion: string
`

const encoder = new TextEncoder()

export const fixtureFile = (path: string, text: string): FileEntry => ({
  path,
  kind: 'file',
  content: encoder.encode(text),
  executable: false,
})

export const callsTree = (bindingSource: string, sdkSource: string): Tree => ({
  entries: [
    fixtureFile(CALLS_CLI_MANIFEST_PATH, CALLS_CLI_MANIFEST),
    fixtureFile(CALLS_BINDING_PATH, bindingSource),
    fixtureFile(CALLS_SDK_MANIFEST_PATH, CALLS_SDK_MANIFEST),
    fixtureFile(CALLS_SDK_PATH, sdkSource),
  ],
})
