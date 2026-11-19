export type DataValue = string | number | boolean | null | readonly DataValue[] | { readonly [key: string]: DataValue }

export interface TypeReference {
  readonly name: string
  readonly arguments?: readonly TypeReference[]
}

export interface Parameter {
  readonly name: string
  readonly type?: TypeReference
}

export type Expression =
  | { readonly kind: 'data'; readonly value: DataValue }
  | { readonly kind: 'identifier'; readonly name: string }
  | { readonly kind: 'member'; readonly object: Expression; readonly property: string }
  | { readonly kind: 'call'; readonly callee: Expression; readonly arguments: readonly Expression[] }
  | { readonly kind: 'await'; readonly expression: Expression }
  | {
      readonly kind: 'arrow'
      readonly async?: boolean
      readonly parameters: readonly Parameter[]
      readonly returnType?: TypeReference
      readonly body: Expression | readonly Statement[]
    }

export interface ConstDeclaration {
  readonly kind: 'const'
  readonly name: string
  readonly exported?: boolean
  readonly type?: TypeReference
  readonly value: Expression
}

export interface FunctionDeclaration {
  readonly kind: 'function'
  readonly name: string
  readonly exported?: boolean
  readonly async?: boolean
  readonly parameters: readonly Parameter[]
  readonly returnType?: TypeReference
  readonly body: readonly Statement[]
}

export type Statement =
  | { readonly kind: 'return'; readonly value?: Expression }
  | { readonly kind: 'expression'; readonly expression: Expression }
  | ConstDeclaration

export type Declaration = ConstDeclaration | FunctionDeclaration

export interface ImportSpecifier {
  readonly name: string
  readonly alias?: string
  readonly typeOnly?: boolean
}

export interface ImportDeclaration {
  readonly from: string
  readonly typeOnly?: boolean
  readonly names: readonly ImportSpecifier[]
}

export interface ModuleDescription {
  readonly header?: string
  readonly imports?: readonly ImportDeclaration[]
  readonly declarations?: readonly Declaration[]
}
