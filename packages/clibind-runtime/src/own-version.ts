import type { Files } from '@ai-swfactory-oss/files'

export type OwnVersion = { readonly kind: 'found'; readonly version: string } | { readonly kind: 'no-version' }

export interface OwnVersionRequest {
  readonly packageName: string
  readonly fromPath: string
}

export interface OwnVersionReaderPorts {
  readonly files: Files
}

export interface OwnVersionReaderOptions {
  readonly ports: OwnVersionReaderPorts
}

export interface OwnVersionReader {
  readonly read: (request: OwnVersionRequest) => Promise<OwnVersion>
}

type Level =
  | { readonly kind: 'manifest'; readonly name: unknown; readonly version: unknown }
  | { readonly kind: 'none' }
  | { readonly kind: 'unreadable' }

const MANIFEST = 'package.json'

const decoder = new TextDecoder()

const directoriesAbove = (path: string): readonly string[] => {
  const segments = path.split('/').slice(0, -1)
  const directories: string[] = []
  for (let length = segments.length; length > 0; length -= 1) directories.push(segments.slice(0, length).join('/'))
  return [...directories, '']
}

const manifestPathIn = (directory: string): string => (directory === '' ? MANIFEST : `${directory}/${MANIFEST}`)

const parsedJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const levelOf = async (files: Files, directory: string): Promise<Level> => {
  const snapshot = await files.snapshot({ root: directory, include: [MANIFEST], exclude: [] })
  if (snapshot.kind !== 'snapshot') return { kind: 'unreadable' }
  const manifestPath = manifestPathIn(directory)
  const manifest = snapshot.tree.entries.find(entry => entry.kind === 'file' && entry.path === manifestPath)
  if (manifest?.kind !== 'file') return { kind: 'none' }
  const json = parsedJson(decoder.decode(manifest.content))
  if (typeof json !== 'object' || json === null) return { kind: 'none' }
  return { kind: 'manifest', name: 'name' in json ? json.name : null, version: 'version' in json ? json.version : null }
}

const searchFrom = async (files: Files, request: OwnVersionRequest, directories: readonly string[]): Promise<OwnVersion> => {
  const [directory, ...above] = directories
  if (directory === undefined) return { kind: 'no-version' }
  const level = await levelOf(files, directory)
  if (level.kind === 'unreadable') return { kind: 'no-version' }
  if (level.kind === 'none' || level.name !== request.packageName) return searchFrom(files, request, above)
  return typeof level.version === 'string' ? { kind: 'found', version: level.version } : { kind: 'no-version' }
}

export const createOwnVersionReader = (options: OwnVersionReaderOptions): OwnVersionReader => ({
  read: request => searchFrom(options.ports.files, request, directoriesAbove(request.fromPath)),
})
