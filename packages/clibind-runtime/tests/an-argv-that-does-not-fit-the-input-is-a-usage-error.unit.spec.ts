import { describe, expect, it } from 'vitest'

import { CALLS_BINDING } from './fixtures/calls-binding'
import { runCalls } from './fixtures/calls-run'

const CASES: readonly (readonly [readonly string[], string])[] = [
  [['calls', 'list', '--since', '2026-11-01', '--limit', '5'], 'the argument <account> is missing'],
  [['calls', 'get', 'call-1', 'call-2'], "the argument 'call-2' is unexpected"],
  [['calls', 'list', 'acme', '--limit', '5'], 'the option --since is missing'],
  [['calls', 'list', 'acme', '--since', '2026-11-01', '--limit', 'five'], "the option --limit takes a number, not 'five'"],
  [['calls', 'list', 'acme', '--limit', '5', '--since'], 'the option --since needs a value'],
  [['calls', 'get', 'call-1', '--verbose'], 'the option --verbose is unknown'],
  [['calls', 'get', 'call-1', '--account'], 'the global option --account needs a value'],
]

describe('an argv that does not fit the input is a usage error', () => {
  it('an argv with a missing, extra or mistyped argument, an option without its value or an unknown option writes a usage error to stderr, exits 64 and never calls createSdk', async () => {
    const runs = await Promise.all(CASES.map(([argv]) => runCalls(CALLS_BINDING, argv, { CALLS_ACCOUNT: 'acme' }, [])))

    expect(runs).toEqual(CASES.map(([, message]) => ({ exitCode: 64, output: [{ stream: 'stderr', text: `${message}\n` }], configs: [] })))
  })
})
