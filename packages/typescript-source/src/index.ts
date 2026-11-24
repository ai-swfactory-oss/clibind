import type { ModuleDescription } from './description'
import { renderModule } from './render'

export type {
  ArrayExpression,
  ClassDeclaration,
  ClassMember,
  ConstDeclaration,
  DataValue,
  Declaration,
  Expression,
  ExpressionStatement,
  FunctionDeclaration,
  ImportDeclaration,
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
