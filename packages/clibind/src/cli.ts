#!/usr/bin/env node
import { createClibind } from '@ai-swfactory-oss/clibind-sdk'
import { createNodeFiles } from '@ai-swfactory-oss/files/node'
import { createNodeTerminal } from '@ai-swfactory-oss/terminal/node'

import { runCli } from './cli-program'

const main = async (): Promise<void> => {
  process.exitCode = await runCli(
    {
      clibind: createClibind(),
      files: createNodeFiles({ root: process.cwd() }),
      terminal: createNodeTerminal(),
    },
    process.argv.slice(2),
  )
}

void main()
