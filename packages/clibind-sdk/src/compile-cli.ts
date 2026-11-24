import { type Expression, type ImportDeclaration, renderTypeScriptSource } from '@ai-swfactory-oss/typescript-source'

import type { CompiledOperation } from './compile-binding'
import type { GlobalOption } from './model'

export const CLI_PATH = 'cli.ts'

export const BINDING_JSON_PATH = 'cli.binding.json'

const RUNTIME_MODULE = '@ai-swfactory-oss/clibind-runtime'

export interface NodeAdapter {
  readonly port: string
  readonly constructorName: string
  readonly from: string
}

const identifier = (name: string): Expression => ({ kind: 'identifier', name })

const member = (object: Expression, property: string): Expression => ({ kind: 'member', object, property })

const call = (callee: Expression, args: readonly Expression[]): Expression => ({ kind: 'call', callee, arguments: args })

const processMember = (property: string): Expression => member(identifier('process'), property)

const namedImport = (from: string, names: readonly string[]): ImportDeclaration => ({
  from,
  default: { kind: 'none' },
  names: names.map(name => ({ name })),
  attributes: [],
})

const adapterImports = (adapters: readonly NodeAdapter[]): readonly ImportDeclaration[] => {
  const byModule = new Map<string, string[]>()
  for (const adapter of adapters) byModule.set(adapter.from, [...(byModule.get(adapter.from) ?? []), adapter.constructorName])
  return [...byModule.entries()].map(([from, names]) => namedImport(from, [...new Set(names)].sort()))
}

const createSdk = (create: string, adapters: readonly NodeAdapter[]): Expression => ({
  kind: 'arrow',
  parameters: [{ name: 'config' }],
  body: call(identifier(create), [
    identifier('config'),
    {
      kind: 'record',
      layout: 'inline',
      entries: [
        {
          key: 'ports',
          value: {
            kind: 'record',
            layout: 'inline',
            entries: adapters.map(adapter => ({ key: adapter.port, value: call(identifier(adapter.constructorName), []) })),
          },
        },
      ],
    },
  ]),
})

const mainArguments = (create: string, adapters: readonly NodeAdapter[]): Expression => ({
  kind: 'record',
  layout: 'multi-line',
  entries: [
    { key: 'binding', value: identifier('binding') },
    { key: 'argv', value: call(member(processMember('argv'), 'slice'), [{ kind: 'data', value: 2 }]) },
    { key: 'env', value: processMember('env') },
    { key: 'stdout', value: processMember('stdout') },
    { key: 'stderr', value: processMember('stderr') },
    { key: 'createSdk', value: createSdk(create, adapters) },
  ],
})

export const cliSource = (packageName: string, create: string, adapters: readonly NodeAdapter[]): string =>
  renderTypeScriptSource({
    imports: [
      [namedImport(RUNTIME_MODULE, ['main']), ...adapterImports(adapters), namedImport(packageName, [create])],
      [
        {
          from: `./${BINDING_JSON_PATH}`,
          default: { kind: 'default', name: 'binding' },
          names: [],
          attributes: [{ key: 'type', value: 'json' }],
        },
      ],
    ],
    declarations: [
      {
        kind: 'expression',
        expression: {
          kind: 'assign',
          target: processMember('exitCode'),
          value: { kind: 'await', expression: call(identifier('main'), [mainArguments(create, adapters)]) },
        },
      },
    ],
  })

export const bindingJson = (globals: readonly GlobalOption<string>[], operations: readonly CompiledOperation[]): string =>
  `${JSON.stringify(
    {
      globals: globals.map(({ flag, env, field, type }) => ({ flag, env, field, type })),
      operations: operations.map(({ operation, model }) => ({
        operation,
        command: model.command,
        input: model.input,
        output: model.output,
      })),
    },
    null,
    2,
  )}\n`
