import type { Tree } from '@ai-swfactory-oss/files'

import { compile } from './compile'
import type { CompileResult } from './compile-step'

export type { Binding, BoundOperation, FieldOf, Op, Operation, SdkReference } from './binding'
export { bind } from './binding'
export type { CompileDiagnostic, CompileResult } from './compile-step'
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

export interface Clibind {
  readonly compile: (tree: Tree, bindingPath: string, sdkPath: string) => CompileResult
}

export const createClibind = (): Clibind => ({ compile })
