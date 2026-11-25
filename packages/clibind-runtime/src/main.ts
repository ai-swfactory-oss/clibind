import {
  type ArgValue,
  EXIT_TABLE,
  type FailureCategory,
  type GlobalOption,
  type InputArg,
  openCliDocument,
  type OperationJson,
  type OptionArg,
  type Outcome,
  parseBindingJson,
  parseOpenCliTemplate,
  type Parser,
  type ScalarType,
  type SwitchArg,
} from '@ai-swfactory-oss/clibind-sdk'
import type { Terminal, TerminalStream } from '@ai-swfactory-oss/terminal'

import type { OwnVersion } from './own-version'

export type Env = Readonly<Record<string, string | undefined>>

export type SdkConfig = Readonly<Record<string, ArgValue>>

export type OperationData = Readonly<Record<string, ArgValue>>

const OPENCLI_FLAG = '--opencli'

export interface MainInput {
  readonly binding: unknown
  readonly opencli: unknown
  readonly version: OwnVersion
  readonly argv: readonly string[]
  readonly env: Env
  readonly createSdk: (config: SdkConfig) => unknown
}

export interface ClibindRuntimePorts {
  readonly terminal: Terminal
}

export interface ClibindRuntimeOptions {
  readonly ports: ClibindRuntimePorts
}

export interface ClibindRuntime {
  readonly main: (input: MainInput) => Promise<number>
}

type Step<T> =
  | { readonly kind: 'read'; readonly value: T }
  | { readonly kind: 'failure'; readonly outcome: FailureCategory; readonly message: string }

const read = <T>(value: T): Step<T> => ({ kind: 'read', value })

const failure = <T>(outcome: FailureCategory, message: string): Step<T> => ({ kind: 'failure', outcome, message })

const usage = <T>(message: string): Step<T> => failure('usage', message)

interface GlobalsRead {
  readonly config: SdkConfig
  readonly rest: readonly string[]
}

interface Invocation {
  readonly operation: OperationJson
  readonly data: OperationData
}

type FlagArg = OptionArg<string> | SwitchArg<string>

type SdkOperation = (data: OperationData) => unknown

const scalarOf = (type: ScalarType, text: string): ArgValue | undefined => {
  if (type === 'string') return text
  const value = Number(text)
  return text.trim() !== '' && Number.isFinite(value) ? value : undefined
}

const globalsOf = (globals: readonly GlobalOption<string>[], argv: readonly string[], env: Env): Step<GlobalsRead> => {
  const flags = new Map(globals.map(option => [option.flag, option]))
  const given = new Map<string, string>()
  const rest: string[] = []
  let pending: GlobalOption<string> | undefined
  for (const word of argv) {
    const option = flags.get(word)
    if (pending !== undefined) {
      given.set(pending.field, word)
      pending = undefined
    } else if (option === undefined) rest.push(word)
    else pending = option
  }
  if (pending !== undefined) return usage(`the global option ${pending.flag} needs a value`)
  const config: Record<string, ArgValue> = {}
  for (const option of globals) {
    const text = given.get(option.field) ?? env[option.env]
    if (text === undefined) return usage(`the global option ${option.flag} is missing: pass ${option.flag} or set ${option.env}`)
    const value = scalarOf(option.type, text)
    if (value === undefined) return usage(`the global option ${option.flag} takes a ${option.type}, not '${text}'`)
    config[option.field] = value
  }
  return read({ config, rest })
}

const startsWith = (words: readonly string[], prefix: readonly string[]): boolean => prefix.every((word, index) => words[index] === word)

const operationOf = (operations: readonly OperationJson[], words: readonly string[]): OperationJson | undefined =>
  operations
    .filter(operation => startsWith(words, operation.command))
    .reduce<
      OperationJson | undefined
    >((longest, operation) => (longest === undefined || operation.command.length > longest.command.length ? operation : longest), undefined)

const isFlagArg = (arg: InputArg<string>): arg is FlagArg => arg.kind !== 'positional'

const valueOf = (
  arg: InputArg<string>,
  positional: string | undefined,
  options: ReadonlyMap<string, string>,
  switches: ReadonlySet<string>,
): Step<ArgValue> => {
  switch (arg.kind) {
    case 'switch':
      return read(switches.has(arg.field))
    case 'positional': {
      if (positional === undefined) return usage(`the argument <${arg.field}> is missing`)
      const value = scalarOf(arg.type, positional)
      return value === undefined ? usage(`the argument <${arg.field}> takes a ${arg.type}, not '${positional}'`) : read(value)
    }
    case 'option': {
      const text = options.get(arg.field)
      if (text === undefined) return usage(`the option ${arg.flag} is missing`)
      const value = scalarOf(arg.type, text)
      return value === undefined ? usage(`the option ${arg.flag} takes a ${arg.type}, not '${text}'`) : read(value)
    }
  }
}

const dataOf = (operation: OperationJson, words: readonly string[]): Step<OperationData> => {
  const flags = new Map(operation.input.filter(isFlagArg).map(arg => [arg.flag, arg]))
  const positionals: string[] = []
  const options = new Map<string, string>()
  const switches = new Set<string>()
  let pending: OptionArg<string> | undefined
  for (const word of words) {
    const flag = flags.get(word)
    if (pending !== undefined) {
      options.set(pending.field, word)
      pending = undefined
    } else if (flag !== undefined) {
      if (flag.kind === 'switch') switches.add(flag.field)
      else pending = flag
    } else if (word.startsWith('-')) return usage(`the option ${word} is unknown`)
    else positionals.push(word)
  }
  if (pending !== undefined) return usage(`the option ${pending.flag} needs a value`)
  const positionalFields = operation.input.flatMap(arg => (arg.kind === 'positional' ? [arg.field] : []))
  const extra = positionals.slice(positionalFields.length)
  if (extra.length > 0) return usage(`the argument '${extra.join(' ')}' is unexpected`)
  const data: Record<string, ArgValue> = {}
  for (const arg of operation.input) {
    const value = valueOf(arg, positionals[positionalFields.indexOf(arg.field)], options, switches)
    if (value.kind === 'failure') return value
    data[arg.field] = value.value
  }
  return read(data)
}

const invocationOf = (operations: readonly OperationJson[], words: readonly string[]): Step<Invocation> => {
  const operation = operationOf(operations, words)
  if (operation === undefined) return usage(`no command matches '${words.join(' ')}'`)
  const data = dataOf(operation, words.slice(operation.command.length))
  return data.kind === 'failure' ? data : read({ operation, data: data.value })
}

const unsupported = (parser: Parser): string => `the output form '${parser}' is not supported`

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> => typeof value === 'object' && value !== null

const isOperation = (value: unknown): value is SdkOperation => typeof value === 'function'

const settled = async (sdk: unknown, path: readonly string[], data: OperationData): Promise<Step<unknown>> => {
  const parent = path.slice(0, -1).reduce<unknown>((node, key) => (isRecord(node) ? node[key] : undefined), sdk)
  const name = path.at(-1)
  const target = isRecord(parent) && name !== undefined ? parent[name] : undefined
  if (!isOperation(target)) return failure('failed', `the sdk has no operation ${path.join('.')}`)
  try {
    return read(await Promise.resolve(target.call(parent, data)))
  } catch (error) {
    return failure('failed', error instanceof Error ? error.message : String(error))
  }
}

const isLines = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((line: unknown) => typeof line === 'string')

const renderedAs = (parser: Parser, value: unknown): Step<string> => {
  switch (parser) {
    case 'json':
      return read(`${JSON.stringify(value ?? null)}\n`)
    case 'lines':
      return isLines(value) ? read(value.map(line => `${line}\n`).join('')) : failure('failed', 'the lines result is not a list of strings')
    case 'exit-code':
      return read('')
    case 'porcelain-v2':
      return failure('failed', unsupported(parser))
  }
}

const written = async (terminal: Terminal, stream: TerminalStream, text: string, outcome: Outcome): Promise<Outcome> => {
  if (text === '') return outcome
  return (await terminal.write(stream, text)).kind === 'closed' ? 'broken-pipe' : outcome
}

const failed = (terminal: Terminal, step: { readonly outcome: FailureCategory; readonly message: string }): Promise<Outcome> =>
  written(terminal, 'stderr', `${step.message}\n`, step.outcome)

const issuesText = (issues: readonly { readonly path: readonly string[]; readonly message: string }[]): string =>
  issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')

const printedOpenCli = async (terminal: Terminal, opencli: unknown, version: OwnVersion): Promise<Outcome> => {
  const parsed = parseOpenCliTemplate(opencli)
  if (!parsed.success)
    return failed(terminal, {
      outcome: 'failed',
      message: `the opencli template is not a compiled cli.opencli.json: ${issuesText(parsed.issues)}`,
    })
  if (version.kind === 'no-version')
    return failed(terminal, { outcome: 'failed', message: "the cli's own package.json has no version, so it has no OpenCLI document" })
  return written(terminal, 'stdout', `${JSON.stringify(openCliDocument(parsed.template, version.version), null, 2)}\n`, 'success')
}

const run = async (terminal: Terminal, { binding, opencli, version, argv, env, createSdk }: MainInput): Promise<Outcome> => {
  if (argv.includes(OPENCLI_FLAG)) return printedOpenCli(terminal, opencli, version)
  const parsed = parseBindingJson(binding)
  if (!parsed.success)
    return failed(terminal, {
      outcome: 'failed',
      message: `the binding is not a compiled cli.binding.json: ${issuesText(parsed.issues)}`,
    })
  const globals = globalsOf(parsed.binding.globals, argv, env)
  if (globals.kind === 'failure') return failed(terminal, globals)
  const invocation = invocationOf(parsed.binding.operations, globals.value.rest)
  if (invocation.kind === 'failure') return failed(terminal, invocation)
  const { operation, data } = invocation.value
  if (operation.output.parser === 'porcelain-v2')
    return failed(terminal, { outcome: 'failed', message: unsupported(operation.output.parser) })
  const result = await settled(createSdk(globals.value.config), operation.operation, data)
  if (result.kind === 'failure') return failed(terminal, result)
  const text = renderedAs(operation.output.parser, result.value)
  if (text.kind === 'failure') return failed(terminal, text)
  return written(terminal, 'stdout', text.value, 'success')
}

const exitCodeOf = (outcome: Outcome): number => {
  const row = EXIT_TABLE.find(candidate => candidate.outcome === outcome)
  if (row === undefined) throw new Error(`the exit table has no row for the outcome '${outcome}'`)
  return row.code
}

export const createClibindRuntime = (options: ClibindRuntimeOptions): ClibindRuntime => ({
  main: async input => exitCodeOf(await run(options.ports.terminal, input)),
})
