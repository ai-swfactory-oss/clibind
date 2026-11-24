import type { Clibind, CompileResult } from '../index'

export const createFakeClibind = (result: CompileResult = { kind: 'compiled', outputs: { entries: [] } }): Clibind => ({
  compile: () => result,
})
