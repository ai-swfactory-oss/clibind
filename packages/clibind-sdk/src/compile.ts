import type { FileEntry, Tree } from '@ai-swfactory-oss/files'

import { compiledBindingOf } from './compile-binding'
import { BINDING_JSON_PATH, bindingJson, CLI_PATH, cliSource, type NodeAdapter } from './compile-cli'
import { compiledSdkOf } from './compile-sdk'
import { type CompileResult, each, read, refused, type Step } from './compile-step'

const NODE_ADAPTERS: ReadonlyMap<string, NodeAdapter> = new Map([
  ['clock', { port: 'clock', constructorName: 'createSystemClock', from: '@ai-swfactory-oss/clibind-runtime/node' }],
])

const encoder = new TextEncoder()

const output = (path: string, text: string): FileEntry => ({ path, kind: 'file', content: encoder.encode(text), executable: false })

const adapterOf = (sdkPath: string, port: string): Step<NodeAdapter> => {
  const adapter = NODE_ADAPTERS.get(port)
  return adapter === undefined
    ? refused(sdkPath, `the sdk's create declares the port '${port}', which has no known node adapter`)
    : read(adapter)
}

export const compile = (tree: Tree, bindingPath: string, sdkPath: string): CompileResult => {
  const binding = compiledBindingOf(tree, bindingPath)
  if (binding.kind === 'refused') return binding
  const sdk = compiledSdkOf(tree, sdkPath, binding.value.create)
  if (sdk.kind === 'refused') return sdk
  const adapters = each(sdk.value.ports.map(port => adapterOf(sdkPath, port)))
  if (adapters.kind === 'refused') return adapters
  return {
    kind: 'compiled',
    outputs: {
      entries: [
        output(BINDING_JSON_PATH, bindingJson(binding.value.globals, binding.value.operations)),
        output(CLI_PATH, cliSource(sdk.value.packageName, sdk.value.create, adapters.value)),
      ],
    },
  }
}
