import { type Clibind, EXIT_TABLE, type Outcome } from '@ai-swfactory-oss/clibind-sdk'
import type { Files } from '@ai-swfactory-oss/files'
import type { Terminal } from '@ai-swfactory-oss/terminal'
import { Command } from 'commander'

export interface CliDependencies {
  readonly clibind: Clibind
  readonly files: Files
  readonly terminal: Terminal
}

const MANIFEST = 'package.json'

const RUNTIME = { module: '@ai-swfactory-oss/clibind-runtime' }

const exitCodeOf = (outcome: Outcome): number => {
  const row = EXIT_TABLE.find(candidate => candidate.outcome === outcome)
  if (row === undefined) throw new Error(`the exit table has no row for the outcome '${outcome}'`)
  return row.code
}

const normalised = (path: string): string =>
  path
    .split('/')
    .filter(segment => segment !== '' && segment !== '.')
    .join('/')

const manifestCandidates = (path: string): readonly string[] => {
  const segments = path.split('/').slice(0, -1)
  const candidates: string[] = []
  for (let length = segments.length; length > 0; length -= 1) candidates.push(`${segments.slice(0, length).join('/')}/${MANIFEST}`)
  return [...candidates, MANIFEST]
}

const compileCommand = async (dependencies: CliDependencies, bindingPath: string, sdkPath: string): Promise<Outcome> => {
  const { clibind, files, terminal } = dependencies
  const snapshot = await files.snapshot({
    root: '',
    include: [...new Set([bindingPath, sdkPath, ...manifestCandidates(bindingPath), ...manifestCandidates(sdkPath)])],
    exclude: [],
  })
  if (snapshot.kind !== 'snapshot') {
    await terminal.write('stderr', `clibind: the binding and sdk could not be read: ${snapshot.kind}\n`)
    return 'failed'
  }
  const result = clibind.compile(snapshot.tree, bindingPath, sdkPath, RUNTIME)
  if (result.kind === 'refused') {
    for (const diagnostic of result.diagnostics) await terminal.write('stderr', `${diagnostic.path}: ${diagnostic.message}\n`)
    return 'failed'
  }
  for (const output of result.outputs.entries) await terminal.write('stdout', `${output.path}\n`)
  return 'success'
}

export const runCli = async (dependencies: CliDependencies, argv: readonly string[]): Promise<number> => {
  let outcome: Outcome = 'success'
  await new Command('clibind')
    .description('Bind a CLI to a TypeScript SDK and compile it.')
    .addCommand(
      new Command('compile')
        .description('Compile the binding against the sdk it names and print the path of every output.')
        .argument('<binding>', 'the binding module')
        .argument('<sdk>', 'the sdk module whose create the binding names')
        .action(async (binding: string, sdk: string) => {
          outcome = await compileCommand(dependencies, normalised(binding), normalised(sdk))
        }),
    )
    .parseAsync([...argv], { from: 'user' })
  return exitCodeOf(outcome)
}
