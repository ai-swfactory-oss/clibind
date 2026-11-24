import { describe, expect, it } from 'vitest'

import type { DataValue, Expression, ModuleDescription } from '../src/index'
import { renderTypeScriptSource } from '../src/index'

const lines = (...text: readonly string[]): string => `${text.join('\n')}\n`

const backslash = String.fromCharCode(0x5c)

const identifier = (name: string): Expression => ({ kind: 'identifier', name })

const data = (value: DataValue): Expression => ({ kind: 'data', value })

const member = (object: Expression, property: string): Expression => ({ kind: 'member', object, property })

const call = (callee: Expression, ...args: readonly Expression[]): Expression => ({
  kind: 'call',
  callee,
  arguments: args,
})

describe('renderTypeScriptSource', () => {
  it('named-imports-render-with-their-aliases', () => {
    const source = renderTypeScriptSource({
      imports: [
        [
          {
            default: { kind: 'none' },
            attributes: [],
            from: 'commander',
            names: [{ name: 'Command' }, { name: 'Option', alias: 'CliOption' }],
          },
          { default: { kind: 'none' }, attributes: [], from: './later', names: [{ name: 'zeta' }, { name: 'alpha', alias: 'first' }] },
        ],
      ],
    })

    expect(source).toBe(lines("import { Command, Option as CliOption } from 'commander'", "import { zeta, alpha as first } from './later'"))
  })

  it('type-only-imports-render-as-import-type', () => {
    const source = renderTypeScriptSource({
      imports: [
        [
          {
            default: { kind: 'none' },
            attributes: [],
            from: './types',
            typeOnly: true,
            names: [{ name: 'Shape' }, { name: 'Binding', alias: 'CliBinding' }],
          },
          { default: { kind: 'none' }, attributes: [], from: './mixed', names: [{ name: 'value' }, { name: 'Options', typeOnly: true }] },
        ],
      ],
    })

    expect(source).toBe(
      lines("import type { Shape, Binding as CliBinding } from './types'", "import { value, type Options } from './mixed'"),
    )
  })

  it('an-exported-const-renders-its-data-value-as-a-literal', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'config',
          exported: true,
          value: {
            kind: 'data',
            value: {
              name: 'clibind',
              count: 3,
              ratio: -1.5,
              enabled: true,
              disabled: false,
              missing: null,
              tags: ['run', 2, [], {}],
              nested: { empty: [], deeper: { flag: true } },
            },
          },
        },
      ],
    })

    expect(source).toBe(
      lines(
        'export const config = {',
        "  name: 'clibind',",
        '  count: 3,',
        '  ratio: -1.5,',
        '  enabled: true,',
        '  disabled: false,',
        '  missing: null,',
        '  tags: [',
        "    'run',",
        '    2,',
        '    [],',
        '    {},',
        '  ],',
        '  nested: {',
        '    empty: [],',
        '    deeper: {',
        '      flag: true,',
        '    },',
        '  },',
        '}',
      ),
    )
  })

  it('string-literals-and-keys-are-escaped', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'escaped',
          exported: true,
          value: {
            kind: 'data',
            value: {
              'kebab-key': "it's",
              '1st': 'back\\slash',
              valid_$Key: 'line\nbreak\r\tend',
              é: 'café ☃',
              'say "hi"': 'quote " stays',
            },
          },
        },
      ],
    })

    expect(source).toBe(
      lines(
        'export const escaped = {',
        String.raw`  'kebab-key': 'it\'s',`,
        String.raw`  '1st': 'back\\slash',`,
        String.raw`  valid_$Key: 'line\nbreak\r\tend',`,
        `  '${backslash}u00e9': 'caf${backslash}u00e9 ${backslash}u2603',`,
        `  'say "hi"': 'quote " stays',`,
        '}',
      ),
    )
  })

  it('a-const-renders-its-type-reference', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'bindings',
          exported: true,
          type: { name: 'Record', arguments: [{ name: 'string' }, { name: 'Binding' }] },
          value: { kind: 'data', value: {} },
        },
        { kind: 'const', name: 'limit', type: { name: 'Limit' }, value: { kind: 'data', value: 10 } },
      ],
    })

    expect(source).toBe(lines('export const bindings: Record<string, Binding> = {}', '', 'const limit: Limit = 10'))
  })

  it('an-exported-function-renders-its-signature-and-body', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'function',
          name: 'run',
          exported: true,
          async: true,
          parameters: [
            { name: 'argv', type: { name: 'ReadonlyArray', arguments: [{ name: 'string' }] } },
            { name: 'options', type: { name: 'Options' } },
          ],
          returnType: { name: 'Promise', arguments: [{ name: 'void' }] },
          body: [{ kind: 'expression', expression: call(identifier('start'), identifier('argv'), identifier('options')) }],
        },
        {
          kind: 'function',
          name: 'identity',
          exported: true,
          parameters: [{ name: 'value', type: { name: 'string' } }],
          returnType: { name: 'string' },
          body: [{ kind: 'return', value: identifier('value') }],
        },
        { kind: 'function', name: 'noop', parameters: [], body: [] },
      ],
    })

    expect(source).toBe(
      lines(
        'export async function run(argv: ReadonlyArray<string>, options: Options): Promise<void> {',
        '  start(argv, options)',
        '}',
        '',
        'export function identity(value: string): string {',
        '  return value',
        '}',
        '',
        'function noop() {}',
      ),
    )
  })

  it('call-member-await-arrow-and-return-render', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'function',
          name: 'main',
          exported: true,
          async: true,
          parameters: [],
          body: [
            {
              kind: 'const',
              name: 'program',
              value: call(member(identifier('commander'), 'createCommand'), { kind: 'data', value: 'clibind' }),
            },
            {
              kind: 'expression',
              expression: call(identifier('register'), { kind: 'data', value: { name: 'run' } }),
            },
            {
              kind: 'const',
              name: 'double',
              value: {
                kind: 'arrow',
                parameters: [{ name: 'value', type: { name: 'number' } }],
                body: call(member(identifier('Math'), 'round'), identifier('value')),
              },
            },
            {
              kind: 'const',
              name: 'load',
              value: {
                kind: 'arrow',
                async: true,
                parameters: [],
                returnType: { name: 'Promise', arguments: [{ name: 'Config' }] },
                body: [
                  {
                    kind: 'return',
                    value: {
                      kind: 'await',
                      expression: call(identifier('read'), {
                        kind: 'arrow',
                        parameters: [],
                        body: { kind: 'data', value: {} },
                      }),
                    },
                  },
                ],
              },
            },
            { kind: 'expression', expression: { kind: 'await', expression: call(member(identifier('program'), 'parseAsync')) } },
            { kind: 'return' },
          ],
        },
      ],
    })

    expect(source).toBe(
      lines(
        'export async function main() {',
        "  const program = commander.createCommand('clibind')",
        '  register({',
        "    name: 'run',",
        '  })',
        '  const double = (value: number) => Math.round(value)',
        '  const load = async (): Promise<Config> => {',
        '    return await read(() => ({}))',
        '  }',
        '  await program.parseAsync()',
        '  return',
        '}',
      ),
    )
  })

  it('a-header-comment-renders-first', () => {
    const source = renderTypeScriptSource({
      header: 'Generated by clibind.\nDo not edit.',
      imports: [[{ default: { kind: 'none' }, attributes: [], from: 'commander', names: [{ name: 'Command' }] }]],
      declarations: [{ kind: 'const', name: 'name', exported: true, value: { kind: 'data', value: 'clibind' } }],
    })

    expect(source).toBe(
      lines('// Generated by clibind.', '// Do not edit.', '', "import { Command } from 'commander'", '', "export const name = 'clibind'"),
    )
  })

  it('a module whose imports are an empty list renders no import block', () => {
    const source = renderTypeScriptSource({
      header: 'Generated by clibind.',
      imports: [],
      declarations: [{ kind: 'const', name: 'name', exported: true, value: { kind: 'data', value: 'clibind' } }],
    })

    expect(source).toBe(lines('// Generated by clibind.', '', "export const name = 'clibind'"))
    expect(source).not.toContain('import')
  })

  it('the-same-description-renders-the-same-text', () => {
    const description: ModuleDescription = {
      header: 'Generated.',
      imports: [
        [
          { default: { kind: 'none' }, attributes: [], from: './z', names: [{ name: 'zed' }] },
          { default: { kind: 'none' }, attributes: [], from: './a', typeOnly: true, names: [{ name: 'Alpha' }] },
        ],
      ],
      declarations: [
        { kind: 'const', name: 'items', exported: true, value: { kind: 'data', value: { list: ['one', "two's"] } } },
        {
          kind: 'function',
          name: 'run',
          exported: true,
          parameters: [{ name: 'alpha', type: { name: 'Alpha' } }],
          body: [{ kind: 'return', value: call(identifier('zed'), identifier('alpha')) }],
        },
      ],
    }
    const copy: ModuleDescription = structuredClone(description)

    const first = renderTypeScriptSource(description)

    expect(renderTypeScriptSource(description)).toBe(first)
    expect(renderTypeScriptSource(copy)).toBe(first)
    expect(first).toBe(
      lines(
        '// Generated.',
        '',
        "import { zed } from './z'",
        "import type { Alpha } from './a'",
        '',
        'export const items = {',
        '  list: [',
        "    'one',",
        String.raw`    'two\'s',`,
        '  ],',
        '}',
        '',
        'export function run(alpha: Alpha) {',
        '  return zed(alpha)',
        '}',
      ),
    )
    expect(first.endsWith('\n')).toBe(true)
    expect(first.endsWith('\n\n')).toBe(false)
    expect(first).not.toContain('"')
    expect(first).not.toContain('\t')
    expect(first.split('\n').filter(line => line.trimEnd().endsWith(';'))).toEqual([])
    expect(first.split('\n').map(line => (line.length - line.trimStart().length) % 2)).not.toContain(1)
  })

  it('renders a class that extends a type, with readonly members whose initialisers reference this', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'class',
          name: 'InvoicePage',
          exported: true,
          extends: call(identifier('definePage'), {
            kind: 'record',
            layout: 'multi-line',
            entries: [{ key: 'url', value: data('/invoices') }],
          }),
          members: [
            { name: 'total', readonly: true, value: call(member(member({ kind: 'this' }, 'define'), 'text'), data('#total')) },
            { name: 'count', readonly: false, value: data(0) },
          ],
        },
        { kind: 'class', name: 'Plain', exported: false, extends: null, members: [] },
      ],
    })

    expect(source).toBe(
      lines(
        'export class InvoicePage extends definePage({',
        "  url: '/invoices',",
        '}) {',
        "  readonly total = this.define.text('#total')",
        '  count = 0',
        '}',
        '',
        'class Plain {}',
      ),
    )
  })

  it('renders a regexp literal from its pattern and flags', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        { kind: 'const', name: 'total', exported: true, value: { kind: 'regexp', pattern: String.raw`Total: \d+`, flags: 'iu' } },
        { kind: 'const', name: 'plain', value: { kind: 'regexp', pattern: 'a.b', flags: '' } },
      ],
    })

    expect(source).toBe(lines(String.raw`export const total = /Total: \d+/iu`, '', 'const plain = /a.b/'))
  })

  it('renders an identifier reference inside a record and inside an array', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'site',
          exported: true,
          value: call(identifier('defineSite'), {
            kind: 'record',
            layout: 'inline',
            entries: [
              {
                key: 'pages',
                value: { kind: 'array', layout: 'inline', elements: [identifier('InvoiceListPage'), identifier('AdminPage')] },
              },
              { key: 'home', value: identifier('AdminPage') },
            ],
          }),
        },
      ],
    })

    expect(source).toBe(lines('export const site = defineSite({ pages: [InvoiceListPage, AdminPage], home: AdminPage })'))
  })

  it('renders a top-level expression statement in module order', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        { kind: 'const', name: 'first', value: data(1) },
        {
          kind: 'expression',
          expression: call(identifier('describe'), data('identity'), { kind: 'arrow', parameters: [], body: [] }),
        },
        { kind: 'const', name: 'last', value: data(2) },
      ],
    })

    expect(source).toBe(lines('const first = 1', '', "describe('identity', () => {})", '', 'const last = 2'))
  })

  it('renders import groups with one blank line between groups', () => {
    const source = renderTypeScriptSource({
      imports: [
        [{ default: { kind: 'none' }, attributes: [], from: '@ai-swfactory/pome-runtime', names: [{ name: 'definePage' }] }],
        [],
        [
          { default: { kind: 'none' }, attributes: [], from: './InvoicePage', names: [{ name: 'InvoicePage' }] },
          { default: { kind: 'none' }, attributes: [], from: './site', names: [{ name: 'site' }] },
        ],
      ],
      declarations: [{ kind: 'const', name: 'pages', exported: true, value: identifier('site') }],
    })

    expect(source).toBe(
      lines(
        "import { definePage } from '@ai-swfactory/pome-runtime'",
        '',
        "import { InvoicePage } from './InvoicePage'",
        "import { site } from './site'",
        '',
        'export const pages = site',
      ),
    )
  })

  it('renders inline objects and arrays on one line with no trailing comma, and multi-line ones one entry per line', () => {
    const source = renderTypeScriptSource({
      imports: [],
      declarations: [
        {
          kind: 'const',
          name: 'inline',
          exported: true,
          value: {
            kind: 'record',
            layout: 'inline',
            entries: [
              { key: 'selector', value: data('a') },
              { key: 'tags', value: { kind: 'array', layout: 'inline', elements: [data('x'), data('y')] } },
              { key: 'empty', value: { kind: 'record', layout: 'inline', entries: [] } },
              { key: 'none', value: { kind: 'array', layout: 'inline', elements: [] } },
            ],
          },
        },
        {
          kind: 'const',
          name: 'spread',
          exported: true,
          value: {
            kind: 'record',
            layout: 'multi-line',
            entries: [
              { key: 'name', value: data('run') },
              { key: 'list', value: { kind: 'array', layout: 'multi-line', elements: [data('one'), identifier('two')] } },
            ],
          },
        },
      ],
    })

    expect(source).toBe(
      lines(
        "export const inline = { selector: 'a', tags: ['x', 'y'], empty: {}, none: [] }",
        '',
        'export const spread = {',
        "  name: 'run',",
        '  list: [',
        "    'one',",
        '    two,',
        '  ],',
        '}',
      ),
    )
  })
})
