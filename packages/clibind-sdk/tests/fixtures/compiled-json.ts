import type { CompileResult } from '@/index'

const decoder = new TextDecoder()

export const compiledJsonAt = (result: CompileResult, path: string): unknown => {
  const entry = result.kind === 'compiled' ? result.outputs.entries.find(candidate => candidate.path === path) : undefined
  return entry?.kind === 'file' ? JSON.parse(decoder.decode(entry.content)) : result
}
