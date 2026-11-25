import type { TreeEntryJson } from '@ai-swfactory-oss/files'
import { createMemoryFiles } from '@ai-swfactory-oss/files/memory'
import { describe, expect, it } from 'vitest'

import { createOwnVersionReader } from '../src/own-version'
import { CLI_PACKAGE, CLI_ROOT, manifest, RUNNING_MODULE } from './fixtures/manifests'

const readOver = async (entries: readonly TreeEntryJson[]): Promise<unknown> => {
  const created = createMemoryFiles({ entries })
  return created.kind === 'files'
    ? createOwnVersionReader({ ports: { files: created.files } }).read({ packageName: CLI_PACKAGE, fromPath: RUNNING_MODULE })
    : created
}

describe('the own-version reader reports no version', () => {
  it('the own-version reader returns no-version when no package.json up the tree names the given package with a version', async () => {
    expect([
      await readOver([manifest(`${CLI_ROOT}/package.json`, { name: CLI_PACKAGE })]),
      await readOver([manifest('install/package.json', { name: 'consumer', version: '1.0.0' })]),
    ]).toEqual([{ kind: 'no-version' }, { kind: 'no-version' }])
  })
})
