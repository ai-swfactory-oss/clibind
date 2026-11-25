import { createMemoryFiles } from '@ai-swfactory-oss/files/memory'
import { describe, expect, it } from 'vitest'

import { createOwnVersionReader } from '../src/own-version'
import { CLI_PACKAGE, CLI_ROOT, manifest, RUNNING_MODULE } from './fixtures/manifests'

describe('the own-version reader finds the installed version', () => {
  it('the own-version reader over memory files returns found with the version from the nearest package.json up the tree whose name is the given package', async () => {
    const created = createMemoryFiles({
      entries: [
        manifest(`${CLI_ROOT}/dist/package.json`, { name: 'calls-cli-dist', version: '9.9.9' }),
        manifest(`${CLI_ROOT}/package.json`, { name: CLI_PACKAGE, version: '2.0.22' }),
        manifest('install/package.json', { name: 'consumer', version: '1.0.0' }),
      ],
    })

    const read =
      created.kind === 'files'
        ? await createOwnVersionReader({ ports: { files: created.files } }).read({ packageName: CLI_PACKAGE, fromPath: RUNNING_MODULE })
        : created

    expect(read).toEqual({ kind: 'found', version: '2.0.22' })
  })
})
