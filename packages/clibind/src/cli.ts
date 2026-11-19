#!/usr/bin/env node
import { createClibind } from '@ai-swfactory-oss/clibind-sdk'

import { createProgram } from './cli-program'

const main = async (): Promise<void> => {
  await createProgram({
    clibind: createClibind(),
    write: text => process.stdout.write(text),
  }).parseAsync()
}

void main()
