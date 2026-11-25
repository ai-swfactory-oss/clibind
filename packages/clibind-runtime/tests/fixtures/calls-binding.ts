import type { BindingJson, OperationJson } from '@ai-swfactory-oss/clibind-sdk'

export const CALLS_BINDING: BindingJson = {
  globals: [{ flag: '--account', env: 'CALLS_ACCOUNT', field: 'account', type: 'string' }],
  operations: [
    {
      operation: ['calls', 'list'],
      command: ['calls', 'list'],
      input: [
        { kind: 'positional', field: 'account', type: 'string' },
        { kind: 'option', flag: '--since', field: 'since', type: 'string' },
        { kind: 'option', flag: '--limit', field: 'limit', type: 'number' },
        { kind: 'switch', flag: '--missed', field: 'missed' },
      ],
      output: { parser: 'json' },
    },
    {
      operation: ['calls', 'get'],
      command: ['calls', 'get'],
      input: [{ kind: 'positional', field: 'id', type: 'string' }],
      output: { parser: 'json' },
    },
    {
      operation: ['numbers', 'list'],
      command: ['numbers', 'list'],
      input: [],
      output: { parser: 'lines' },
    },
    {
      operation: ['numbers', 'release'],
      command: ['numbers', 'release'],
      input: [{ kind: 'positional', field: 'number', type: 'string' }],
      output: { parser: 'exit-code' },
    },
  ],
}

export const bindingWith = (operations: readonly OperationJson[]): BindingJson => ({ globals: CALLS_BINDING.globals, operations })
