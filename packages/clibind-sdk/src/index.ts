import type { Tree } from '@ai-swfactory-oss/files'

import { compile } from './compile'
import type { RuntimeReference } from './compile-cli'
import type { CompileResult } from './compile-step'

export type { Binding, BoundOperation, FieldOf, GlobalOptions, Op, Operation, SdkReference } from './binding'
export { bind } from './binding'
export type { RuntimeReference } from './compile-cli'
export type { CompileDiagnostic, CompileResult } from './compile-step'
export type { ExitRow, FailureCategory, Outcome } from './exits'
export { EXIT_TABLE, FAILURE_CATEGORIES } from './exits'
export type {
  AcceptedModel,
  ArgValue,
  BindingJson,
  BindingJsonRead,
  BindingModel,
  GlobalOption,
  InputArg,
  ModelIssue,
  OperationJson,
  OptionArg,
  OutputModel,
  Parser,
  PositionalArg,
  RejectedModel,
  ScalarType,
  SwitchArg,
} from './model'
export { argvOf, bindingModelJsonSchema, parseBindingJson, parseBindingModel, PARSERS } from './model'
export type {
  OpenCliArgument,
  OpenCliCommand,
  OpenCliDocument,
  OpenCliExitCode,
  OpenCliOption,
  OpenCliRootCommand,
  OpenCliTemplate,
  OpenCliTemplateRead,
} from './opencli'
export { openCliDocument, parseOpenCliTemplate } from './opencli'
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
  readonly compile: (tree: Tree, bindingPath: string, sdkPath: string, runtime: RuntimeReference) => CompileResult
}

export const createClibind = (): Clibind => ({ compile })
