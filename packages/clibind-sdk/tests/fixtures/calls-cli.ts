export const CALLS_CLI_TS = `import { main } from '@ai-swfactory-oss/clibind-runtime'
import { createSystemClock } from '@ai-swfactory-oss/clibind-runtime/node'
import { createCallsSdk } from '@acme/calls-sdk'

import binding from './cli.binding.json' with { type: 'json' }

process.exitCode = await main({
  binding: binding,
  argv: process.argv.slice(2),
  env: process.env,
  stdout: process.stdout,
  stderr: process.stderr,
  createSdk: (config) => createCallsSdk(config, { ports: { clock: createSystemClock() } }),
})
`

export const CALLS_CLI_BINDING_JSON = `{
  "globals": [
    {
      "flag": "--account",
      "env": "CALLS_ACCOUNT",
      "field": "account",
      "type": "string"
    }
  ],
  "operations": [
    {
      "operation": [
        "calls",
        "list"
      ],
      "command": [
        "calls",
        "list"
      ],
      "input": [
        {
          "kind": "positional",
          "field": "account",
          "type": "string"
        },
        {
          "kind": "option",
          "flag": "--since",
          "field": "since",
          "type": "string"
        },
        {
          "kind": "option",
          "flag": "--limit",
          "field": "limit",
          "type": "number"
        },
        {
          "kind": "switch",
          "flag": "--missed",
          "field": "missed"
        }
      ],
      "output": {
        "parser": "json"
      }
    },
    {
      "operation": [
        "calls",
        "get"
      ],
      "command": [
        "calls",
        "get"
      ],
      "input": [
        {
          "kind": "positional",
          "field": "id",
          "type": "string"
        }
      ],
      "output": {
        "parser": "json"
      }
    },
    {
      "operation": [
        "numbers",
        "release"
      ],
      "command": [
        "numbers",
        "release"
      ],
      "input": [
        {
          "kind": "positional",
          "field": "number",
          "type": "string"
        }
      ],
      "output": {
        "parser": "exit-code"
      }
    }
  ]
}
`
