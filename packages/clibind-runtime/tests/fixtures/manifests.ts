import type { TreeEntryJson } from '@ai-swfactory-oss/files'

export const CLI_PACKAGE = '@acme/calls-cli'

export const CLI_ROOT = 'install/node_modules/@acme/calls-cli'

export const RUNNING_MODULE = `${CLI_ROOT}/dist/cli.js`

export const manifest = (path: string, fields: Readonly<Record<string, string>>): TreeEntryJson => ({
  path,
  kind: 'file',
  content: btoa(JSON.stringify(fields)),
  executable: false,
})
