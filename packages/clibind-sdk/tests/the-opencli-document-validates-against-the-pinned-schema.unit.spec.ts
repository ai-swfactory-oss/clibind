import Ajv2020 from 'ajv/dist/2020'
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
import openCliSchema from './fixtures/opencli.schema.json' with { type: 'json' }

const URI = /^[A-Za-z][A-Za-z0-9+.-]*:\S+$/

describe('the opencli document validates against the pinned schema', () => {
  it('openCliDocument of the compiled calls template and version 1.2.3 validates against the pinned OpenCLI schema', () => {
    const compiled = createClibind().compile(
      callsTree(CALLS_BINDING_SOURCE, CALLS_SDK_SOURCE),
      CALLS_BINDING_PATH,
      CALLS_SDK_PATH,
      CALLS_RUNTIME,
    )
    const template = parseOpenCliTemplate(compiledJsonAt(compiled, 'cli.opencli.json'))

    const validate = new Ajv2020({ unicodeRegExp: false, formats: { uri: URI } }).compile(openCliSchema)

    const valid = template.success ? validate(openCliDocument(template.template, '1.2.3')) : template

    expect({ valid, errors: validate.errors }).toEqual({ valid: true, errors: null })
  })
})
