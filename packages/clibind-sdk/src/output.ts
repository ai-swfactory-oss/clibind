import type { FailureCategory } from './exits'
import type { Parser } from './model'

export interface CliOutput {
  readonly stdout: string
  readonly exitCode: number
}

export interface PorcelainHeader {
  readonly kind: 'header'
  readonly key: string
  readonly value: string
}

export interface PorcelainChanged {
  readonly kind: 'changed' | 'unmerged'
  readonly xy: string
  readonly path: string
}

export interface PorcelainRenamed {
  readonly kind: 'renamed'
  readonly xy: string
  readonly path: string
  readonly origPath: string
}

export interface PorcelainPath {
  readonly kind: 'untracked' | 'ignored'
  readonly path: string
}

export type PorcelainEntry = PorcelainHeader | PorcelainChanged | PorcelainRenamed | PorcelainPath

export interface LinesResult {
  readonly parser: 'lines'
  readonly value: readonly string[]
}

export interface JsonResult {
  readonly parser: 'json'
  readonly value: unknown
}

export interface PorcelainResult {
  readonly parser: 'porcelain-v2'
  readonly value: readonly PorcelainEntry[]
}

export interface ExitCodeResult {
  readonly parser: 'exit-code'
  readonly value: boolean
}

export type OperationResult = LinesResult | JsonResult | PorcelainResult | ExitCodeResult

export interface OutputRead {
  readonly success: true
  readonly result: OperationResult
}

export interface OutputFailed {
  readonly success: false
  readonly category: FailureCategory
  readonly message: string
}

const linesOf = (text: string): readonly string[] => {
  const lines = text.split('\n')
  return lines.at(-1) === '' ? lines.slice(0, -1) : lines
}

const restOf = (words: readonly string[], from: number): string => words.slice(from).join(' ')

const porcelainEntriesOf = (line: string): readonly PorcelainEntry[] => {
  const words = line.split(' ')
  const xy = words[1] ?? ''
  switch (words[0]) {
    case '#':
      return words.length >= 3 ? [{ kind: 'header', key: xy, value: restOf(words, 2) }] : []
    case '1':
      return words.length >= 9 ? [{ kind: 'changed', xy, path: restOf(words, 8) }] : []
    case '2': {
      const [path, origPath] = restOf(words, 9).split('\t')
      return words.length >= 10 && path !== undefined && origPath !== undefined ? [{ kind: 'renamed', xy, path, origPath }] : []
    }
    case 'u':
      return words.length >= 11 ? [{ kind: 'unmerged', xy, path: restOf(words, 10) }] : []
    case '?':
      return words.length >= 2 ? [{ kind: 'untracked', path: restOf(words, 1) }] : []
    case '!':
      return words.length >= 2 ? [{ kind: 'ignored', path: restOf(words, 1) }] : []
    default:
      return []
  }
}

const unreadable = (parser: Parser, detail: string): OutputFailed => ({
  success: false,
  category: 'unreadable-output',
  message: `the ${parser} parser could not read the output: ${detail}`,
})

const readJson = (stdout: string): OutputRead | OutputFailed => {
  try {
    const value: unknown = JSON.parse(stdout)
    return { success: true, result: { parser: 'json', value } }
  } catch (error) {
    return unreadable('json', error instanceof Error ? error.message : 'not JSON')
  }
}

const readPorcelain = (stdout: string): OutputRead | OutputFailed => {
  const lines = linesOf(stdout)
  const entries = lines.flatMap(porcelainEntriesOf)
  if (entries.length !== lines.length) return unreadable('porcelain-v2', 'a line is not a porcelain v2 entry')
  return { success: true, result: { parser: 'porcelain-v2', value: entries } }
}

export const readOutput = (parser: Parser, output: CliOutput): OutputRead | OutputFailed => {
  if (parser === 'exit-code') return { success: true, result: { parser, value: output.exitCode === 0 } }
  if (output.exitCode !== 0)
    return { success: false, category: 'failed', message: `the command exited with code ${String(output.exitCode)}` }
  switch (parser) {
    case 'lines':
      return { success: true, result: { parser, value: linesOf(output.stdout) } }
    case 'json':
      return readJson(output.stdout)
    case 'porcelain-v2':
      return readPorcelain(output.stdout)
  }
}
