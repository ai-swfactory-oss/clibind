import type { Clibind, CompileResult } from '../index'

export const createFakeClibind = (result: CompileResult = { files: [] }): Clibind => ({
  compile: () => result,
})
