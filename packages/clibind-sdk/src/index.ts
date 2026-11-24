export type { Binding, BoundOperation, FieldOf, Op, Operation } from './binding'
export { bind } from './binding'
export type { ExitRow, FailureCategory, Outcome } from './exits'
export { EXIT_TABLE, FAILURE_CATEGORIES } from './exits'
export type {
  AcceptedModel,
  ArgValue,
  BindingModel,
  InputArg,
  ModelIssue,
  OptionArg,
  OutputModel,
  Parser,
  PositionalArg,
  RejectedModel,
  ScalarType,
  SwitchArg,
} from './model'
export { argvOf, bindingModelJsonSchema, parseBindingModel, PARSERS } from './model'
export type {
  CliOutput,
  ExitCodeResult,
  JsonResult,
  LinesResult,
  OperationResult,
  OutputFailed,
  OutputRead,
  PorcelainChanged,
  PorcelainEntry,
  PorcelainHeader,
  PorcelainPath,
  PorcelainRenamed,
  PorcelainResult,
} from './output'
export { readOutput } from './output'

export interface GeneratedFile {
  readonly path: string
  readonly contents: string
}

export interface CompileResult {
  readonly files: readonly GeneratedFile[]
}

export interface Clibind {
  readonly compile: () => CompileResult
}

export const createClibind = (): Clibind => ({
  compile: () => ({ files: [] }),
})
