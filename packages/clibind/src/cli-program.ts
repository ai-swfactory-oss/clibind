import type { Clibind } from '@ai-swfactory-oss/clibind-sdk'
import type { Terminal } from '@ai-swfactory-oss/terminal'
import { Command } from 'commander'

export interface CliDependencies {
  readonly clibind: Clibind
  readonly terminal: Terminal
}

export const createProgram = ({ clibind, terminal }: CliDependencies): Command =>
  new Command('clibind').description('Bind a CLI to a TypeScript SDK and compile it.').addCommand(
    new Command('compile').description('Compile the binding and print the paths of the files it produces.').action(async () => {
      for (const file of clibind.compile().files) {
        await terminal.write('stdout', `${file.path}\n`)
      }
    }),
  )
