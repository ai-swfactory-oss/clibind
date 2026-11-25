import * as published from '@ai-swfactory-oss/clibind-runtime'
import { describe, expect, it } from 'vitest'

describe('the published clibind-runtime entry', () => {
  it('the published clibind-runtime entry exports createClibindRuntime and nothing else', () => {
    expect([typeof published.createClibindRuntime, Object.keys(published).sort()]).toEqual(['function', ['createClibindRuntime']])
  })
})
