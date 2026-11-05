import type { Clibind } from '@ai-swfactory-oss/clibind-sdk'
import { Command } from 'commander'

export interface CliDependencies {
  readonly clibind: Clibind
  readonly write: (text: string) => void
}

export const createProgram = ({ clibind, write }: CliDependencies): Command =>
  new Command('clibind').description('Bind a CLI to a TypeScript SDK and compile it.').addCommand(
    new Command('compile').description('Compile the binding and print the paths of the files it produces.').action(() => {
      for (const file of clibind.compile().files) {
        write(`${file.path}\n`)
      }
    }),
  )
