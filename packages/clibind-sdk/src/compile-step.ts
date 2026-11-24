import type { Tree } from '@ai-swfactory-oss/files'
import type { TypeScriptDiagnostic } from '@ai-swfactory-oss/typescript'

export interface CompileDiagnostic {
  readonly path: string
  readonly message: string
}

export type CompileResult =
  | { readonly kind: 'compiled'; readonly outputs: Tree }
  | { readonly kind: 'refused'; readonly diagnostics: readonly CompileDiagnostic[] }

export interface Refused {
  readonly kind: 'refused'
  readonly diagnostics: readonly CompileDiagnostic[]
}

export type Step<T> = { readonly kind: 'read'; readonly value: T } | Refused

export const read = <T>(value: T): Step<T> => ({ kind: 'read', value })

export const refused = (path: string, message: string): Refused => ({ kind: 'refused', diagnostics: [{ path, message }] })

export const each = <T>(steps: readonly Step<T>[]): Step<readonly T[]> => {
  const values: T[] = []
  const diagnostics: CompileDiagnostic[] = []
  for (const step of steps) {
    if (step.kind === 'read') values.push(step.value)
    else diagnostics.push(...step.diagnostics)
  }
  return diagnostics.length === 0 ? read(values) : { kind: 'refused', diagnostics }
}

export const fromTypeScript = (path: string, diagnostics: readonly TypeScriptDiagnostic[]): Refused => ({
  kind: 'refused',
  diagnostics: diagnostics.map(diagnostic => ({ path: diagnostic.file ?? path, message: diagnostic.message })),
})

const decoder = new TextDecoder()

export const textAt = (tree: Tree, path: string): string | null => {
  const entry = tree.entries.find(candidate => candidate.path === path)
  return entry?.kind === 'file' ? decoder.decode(entry.content) : null
}
