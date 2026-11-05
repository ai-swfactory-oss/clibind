export interface GeneratedFile {
  readonly path: string
  readonly contents: string
}

export interface CompileResult {
  readonly files: readonly GeneratedFile[]
}

export interface Clibind {
  readonly compile: () => CompileResult
}

export const createClibind = (): Clibind => ({
  compile: () => ({ files: [] }),
})
