import type { ModuleDescription } from './description'
import { renderModule } from './render'

export type {
  ConstDeclaration,
  DataValue,
  Declaration,
  Expression,
  FunctionDeclaration,
  ImportDeclaration,
  ImportSpecifier,
  ModuleDescription,
  Parameter,
  Statement,
  TypeReference,
} from './description'

export const renderTypeScriptSource = (description: ModuleDescription): string => renderModule(description)
