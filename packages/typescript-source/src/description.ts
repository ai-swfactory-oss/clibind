export type DataValue = string | number | boolean | null | readonly DataValue[] | { readonly [key: string]: DataValue }

export interface TypeReference {
  readonly name: string
  readonly arguments?: readonly TypeReference[]
}

export interface Parameter {
  readonly name: string
  readonly type?: TypeReference
}

export type Layout = 'inline' | 'multi-line'

export interface RecordEntry {
  readonly key: string
  readonly value: Expression
}

export interface RecordExpression {
  readonly kind: 'record'
  readonly layout: Layout
  readonly entries: readonly RecordEntry[]
}

export interface ArrayExpression {
  readonly kind: 'array'
  readonly layout: Layout
  readonly elements: readonly Expression[]
}

export interface RegExpExpression {
  readonly kind: 'regexp'
  readonly pattern: string
  readonly flags: string
}

export interface ThisExpression {
  readonly kind: 'this'
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
  | RecordExpression
  | ArrayExpression
  | RegExpExpression
  | ThisExpression

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

export interface ClassMember {
  readonly name: string
  readonly readonly: boolean
  readonly value: Expression
}

export interface ClassDeclaration {
  readonly kind: 'class'
  readonly name: string
  readonly exported: boolean
  readonly extends: Expression | null
  readonly members: readonly ClassMember[]
}

export interface ExpressionStatement {
  readonly kind: 'expression'
  readonly expression: Expression
}

export type Statement = { readonly kind: 'return'; readonly value?: Expression } | ExpressionStatement | ConstDeclaration

export type Declaration = ConstDeclaration | FunctionDeclaration | ClassDeclaration | ExpressionStatement

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

export type ImportGroup = readonly ImportDeclaration[]

export interface ModuleDescription {
  readonly header?: string
  readonly imports: readonly ImportGroup[]
  readonly declarations?: readonly Declaration[]
}
