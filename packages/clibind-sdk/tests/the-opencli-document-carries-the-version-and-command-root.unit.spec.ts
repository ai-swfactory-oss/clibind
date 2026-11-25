import { describe, expect, it } from 'vitest'

import { createClibind, openCliDocument, parseOpenCliTemplate } from '../src/index'
import {
  CALLS_BINDING_PATH,
  CALLS_BINDING_SOURCE,
  CALLS_RUNTIME,
  CALLS_SDK_PATH,
  CALLS_SDK_SOURCE,
  callsTree,
} from './fixtures/calls-sources'
import { compiledJsonAt } from './fixtures/compiled-json'

describe('the opencli document carries the version and command root', () => {
  it("openCliDocument sets info.version to the version it is given and info.title to the cli package's bin name", () => {
    const compiled = createClibind().compile(
      callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE),
      CALLS_BINDING_PATH,
      CALLS_SDK_PATH,
      CALLS_RUNTIME,
    )
    const template = parseOpenCliTemplate(compiledJsonAt(compiled, 'cli.opencli.json'))

    expect(template.success ? openCliDocument(template.template, '4.5.6').info : template).toEqual({
      title: 'acme-calls',
      version: '4.5.6',
    })
  })
})
