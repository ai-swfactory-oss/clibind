import type { Tree } from '@ai-swfactory-oss/files'

import { read, refused, type Step, textAt } from './compile-step'

const MANIFEST = 'package.json'

export interface Manifest {
  readonly path: string
  readonly fields: Readonly<Record<string, unknown>>
}

export interface CompiledCli {
  readonly packageName: string
  readonly root: string
}

const directoriesAbove = (path: string): readonly string[] => {
  const segments = path.split('/').slice(0, -1)
  const directories: string[] = []
  for (let length = segments.length; length > 0; length -= 1) directories.push(segments.slice(0, length).join('/'))
  return [...directories, '']
}

const manifestPathIn = (directory: string): string => (directory === '' ? MANIFEST : `${directory}/${MANIFEST}`)

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parsedJson = (text: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export const nearestManifestOf = (tree: Tree, path: string): Manifest | null => {
  for (const directory of directoriesAbove(path)) {
    const manifestPath = manifestPathIn(directory)
    const text = textAt(tree, manifestPath)
    if (text === null) continue
    const fields = parsedJson(text)
    return { path: manifestPath, fields: isRecord(fields) ? fields : {} }
  }
  return null
}

const unscoped = (name: string): string => name.slice(name.indexOf('/') + 1)

const binNamesOf = (packageName: string, bin: unknown): readonly string[] => {
  if (typeof bin === 'string') return [unscoped(packageName)]
  return isRecord(bin) ? Object.keys(bin) : []
}

export const compiledCliOf = (tree: Tree, bindingPath: string): Step<CompiledCli> => {
  const manifest = nearestManifestOf(tree, bindingPath)
  if (manifest === null) return refused(bindingPath, 'the cli has no package.json at or above its binding')
  const name = manifest.fields.name
  if (typeof name !== 'string') return refused(manifest.path, "the cli's package.json names no package")
  const bins = binNamesOf(name, manifest.fields.bin)
  const [root] = bins
  return bins.length === 1 && root !== undefined
    ? read({ packageName: name, root })
    : refused(manifest.path, `the cli's package.json declares ${String(bins.length)} bins, not exactly one`)
}
