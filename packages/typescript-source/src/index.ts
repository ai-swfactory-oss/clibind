import type { ModuleDescription } from './description'
import { renderModule } from './render'

export type {
  ArrayExpression,
  AssignExpression,
  BinaryExpression,
  ClassDeclaration,
  ClassMember,
  ConditionalExpression,
  ConstDeclaration,
  DataValue,
  Declaration,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  IfStatement,
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
  TypeOfExpression,
  TypeReference,
} from './description'

export const renderTypeScriptSource = (description: ModuleDescription): string => renderModule(description)
