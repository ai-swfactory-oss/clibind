import type { ModuleDescription } from './description'
import { renderModule } from './render'

export type {
  ArrayExpression,
  AssignExpression,
  ClassDeclaration,
  ClassMember,
  ConstDeclaration,
  DataValue,
  Declaration,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  ImportAttribute,
  ImportDeclaration,
  ImportDefault,
  ImportGroup,
  ImportSpecifier,
  Layout,
  ModuleDescription,
  Parameter,
  RecordEntry,
  RecordExpression,
  RegExpExpression,
  Statement,
  ThisExpression,
  TypeReference,
} from './description'

export const renderTypeScriptSource = (description: ModuleDescription): string => renderModule(description)
