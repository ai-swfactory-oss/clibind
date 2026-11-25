# clibind

clibind binds a command line to an existing TypeScript SDK's typed operations, the way OpenAPI binds an HTTP API to code, and compiles the CLI from that binding. The SDK stays unaware of the CLI: the binding lives beside it.

## Packages

The workspace's packages:

- `@ai-swfactory-oss/clibind-sdk`: the compiler, which takes plain data and returns files.
- `@ai-swfactory-oss/clibind`: the `clibind` command line over that compiler.
- `@ai-swfactory-oss/clibind-runtime`: the runtime every generated CLI runs on, which runs the bound SDK operation and returns the exit code.
- `@ai-swfactory-oss/typescript-source`: turns a plain-data description of a TypeScript module into its final, deterministic source text.

## Licence

MIT
