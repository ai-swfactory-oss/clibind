import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

const idsOf = (text: string): readonly string[] => {
  const calls: unknown = JSON.parse(text)
  return Array.isArray(calls)
    ? calls.map((call: unknown) => (typeof call === 'object' && call !== null && 'id' in call ? String(call.id) : ''))
    : []
}

describe('main reads the operation input from argv', () => {
  it('main reads positionals in order, options as a flag and its value, switches as true when given and false when absent, and global flags anywhere in argv', async () => {
    const missedOnly = await runCalls(
      CALLS_BINDING,
      ['calls', 'list', '--account', 'acme', 'acme', '--missed', '--limit', '1', '--since', '2026-11-02'],
      {},
      [],
    )
    const all = await runCalls(
      CALLS_BINDING,
      ['calls', 'list', 'acme', '--since', '2026-11-01', '--limit', '5'],
      { CALLS_ACCOUNT: 'acme' },
      [],
    )

    expect([missedOnly, all].map(run => ({ exitCode: run.exitCode, ids: run.output.flatMap(write => idsOf(write.text)) }))).toEqual([
      { exitCode: 0, ids: ['call-2'] },
      { exitCode: 0, ids: ['call-1', 'call-2', 'call-3'] },
    ])
  })
})
