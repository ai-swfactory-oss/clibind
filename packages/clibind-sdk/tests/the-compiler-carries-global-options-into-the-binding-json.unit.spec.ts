import { describe, expect, it } from 'vitest'

import { createClibind } from '../src/index'
import { CALLS_BINDING_PATH, CALLS_BINDING_SOURCE, CALLS_SDK_PATH, CALLS_SDK_SOURCE, callsTree } from './fixtures/calls-sources'

const ACCOUNT_GLOBAL = "    account: { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },\n"

const TIMEOUT_GLOBAL = "    timeout: { flag: '--timeout', env: 'CALLS_TIMEOUT', field: 'timeout', type: 'number' },\n"

const ACCOUNT_FIELD = '  readonly account: string\n'

const decoder = new TextDecoder()

const jsonOf = (content: Uint8Array): unknown => JSON.parse(decoder.decode(content))

describe('the compiler carries global options into the binding json', () => {
  it('the compiled cli.binding.json carries every global option the binding declares', () => {
    const tree = callsTree(
      CALLS_BINDING_SOURCE.replace(ACCOUNT_GLOBAL, `${ACCOUNT_GLOBAL}${TIMEOUT_GLOBAL}`),
      CALLS_SDK_SOURCE.replace(ACCOUNT_FIELD, `${ACCOUNT_FIELD}  readonly timeout: number\n`),
    )

    const result = createClibind().compile(tree, CALLS_BINDING_PATH, CALLS_SDK_PATH)
    const bindingJson = result.kind === 'compiled' ? result.outputs.entries.find(entry => entry.path === 'cli.binding.json') : undefined

    expect(bindingJson?.kind === 'file' ? jsonOf(bindingJson.content) : result).toMatchObject({
      globals: [
        { flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' },
        { flag: '--timeout', env: 'CALLS_TIMEOUT', field: 'timeout', type: 'number' },
      ],
    })
  })
})
