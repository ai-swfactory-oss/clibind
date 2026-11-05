# clibind

clibind binds a command line to an existing TypeScript SDK's typed operations, the way OpenAPI binds an HTTP API to code, and compiles the CLI from that binding. The SDK stays unaware of the CLI: the binding lives beside it.

## Packages

- `@ai-swfactory-oss/clibind-sdk`: the compiler, which takes plain data and returns files.
- `@ai-swfactory-oss/clibind`: the `clibind` command line over that compiler.

## Licence

MIT
