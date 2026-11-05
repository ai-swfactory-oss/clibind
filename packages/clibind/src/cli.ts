#!/usr/bin/env node
import { createRealProcessProvider } from '@ai-swfactory/seams-node'
import { createClibind } from '@ai-swfactory-oss/clibind-sdk'

import { createProgram } from './cli-program'

const main = async (): Promise<void> => {
  const processProvider = createRealProcessProvider()
  await createProgram({
    clibind: createClibind(),
    write: text => process.stdout.write(text),
  }).parseAsync(processProvider.argv, { from: 'node' })
}

void main()
