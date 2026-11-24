#!/usr/bin/env node
import { createClibind } from '@ai-swfactory-oss/clibind-sdk'
import { createNodeTerminal } from '@ai-swfactory-oss/terminal/node'

import { createProgram } from './cli-program'

const main = async (): Promise<void> => {
  await createProgram({
    clibind: createClibind(),
    terminal: createNodeTerminal(),
  }).parseAsync()
}

void main()
