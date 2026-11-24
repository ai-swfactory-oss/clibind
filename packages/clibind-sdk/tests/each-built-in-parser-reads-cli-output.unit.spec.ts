import { describe, expect, it } from 'vitest'

import { readOutput } from '../src/index'

const PORCELAIN = [
  '# branch.oid 1a2b3c',
  '# branch.head main',
  '1 .M N... 100644 100644 100644 aaa111 bbb222 src/a file.ts',
  '2 R. N... 100644 100644 100644 aaa111 bbb222 R100 src/new.ts\tsrc/old.ts',
  'u UU N... 100644 100644 100644 100644 h1 h2 h3 src/clash.ts',
  '? notes.txt',
  '! dist/out.js',
  '',
].join('\n')

describe('each built-in parser reads cli output', () => {
  it("the lines parser turns cli output into the operation's typed result", () => {
    expect(readOutput('lines', { stdout: 'call-1\ncall-2\n', exitCode: 0 })).toEqual({
      success: true,
      result: { parser: 'lines', value: ['call-1', 'call-2'] },
    })
    expect(readOutput('lines', { stdout: '', exitCode: 0 })).toEqual({ success: true, result: { parser: 'lines', value: [] } })
  })

  it("the json parser turns cli output into the operation's typed result", () => {
    expect(readOutput('json', { stdout: '{"calls":[{"id":"call-1","from":"+15550100"}]}\n', exitCode: 0 })).toEqual({
      success: true,
      result: { parser: 'json', value: { calls: [{ id: 'call-1', from: '+15550100' }] } },
    })
    expect(readOutput('json', { stdout: 'not json', exitCode: 0 })).toMatchObject({ success: false, category: 'unreadable-output' })
  })

  it("the porcelain-v2 parser turns cli output into the operation's typed result", () => {
    expect(readOutput('porcelain-v2', { stdout: PORCELAIN, exitCode: 0 })).toEqual({
      success: true,
      result: {
        parser: 'porcelain-v2',
        value: [
          { kind: 'header', key: 'branch.oid', value: '1a2b3c' },
          { kind: 'header', key: 'branch.head', value: 'main' },
          { kind: 'changed', xy: '.M', path: 'src/a file.ts' },
          { kind: 'renamed', xy: 'R.', path: 'src/new.ts', origPath: 'src/old.ts' },
          { kind: 'unmerged', xy: 'UU', path: 'src/clash.ts' },
          { kind: 'untracked', path: 'notes.txt' },
          { kind: 'ignored', path: 'dist/out.js' },
        ],
      },
    })
    expect(readOutput('porcelain-v2', { stdout: 'M  src/a.ts\n', exitCode: 0 })).toMatchObject({
      success: false,
      category: 'unreadable-output',
    })
  })

  it("the exit-code parser turns cli output into the operation's typed result", () => {
    expect(readOutput('exit-code', { stdout: '', exitCode: 0 })).toEqual({ success: true, result: { parser: 'exit-code', value: true } })
    expect(readOutput('exit-code', { stdout: '', exitCode: 1 })).toEqual({ success: true, result: { parser: 'exit-code', value: false } })
  })
})
