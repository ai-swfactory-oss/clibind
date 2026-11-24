import type { Tree } from '@ai-swfactory-oss/files'
import { moduleSyntaxOf, type SyntaxExpression, type SyntaxStatement } from '@ai-swfactory-oss/typescript'

import { each, fromTypeScript, read, refused, type Step } from './compile-step'
import { type BindingModel, parseBindingModel } from './model'

export interface CompiledOperation {
  readonly operation: readonly string[]
  readonly model: BindingModel<string>
}

export interface CompiledBinding {
  readonly create: string
  readonly operations: readonly CompiledOperation[]
}

const described = (expression: SyntaxExpression): string =>
  expression.kind === 'unsupported'
    ? `'${expression.syntax}' at ${String(expression.line)}:${String(expression.column)}`
    : `a ${expression.kind} expression`

const dataOf = (path: string, expression: SyntaxExpression): Step<unknown> => {
  switch (expression.kind) {
    case 'string':
    case 'number':
    case 'boolean':
      return read(expression.value)
    case 'array':
      return each(expression.elements.map(element => dataOf(path, element)))
    case 'object': {
      const entries = each(
        expression.properties.map((property): Step<readonly [string, unknown]> => {
          if (property.kind !== 'property') return refused(path, `a binding model holds ${described(property)}, which is not plain data`)
          const value = dataOf(path, property.value)
          return value.kind === 'read' ? read([property.name, value.value]) : value
        }),
      )
      return entries.kind === 'read' ? read(Object.fromEntries(entries.value)) : entries
    }
    default:
      return refused(path, `a binding model holds ${described(expression)}, which is not plain data`)
  }
}

const selectorPathOf = (path: string, selector: SyntaxExpression): Step<readonly string[]> => {
  if (selector.kind !== 'arrow' || selector.parameters.length !== 1) {
    return refused(path, `an operation selector must be an arrow of one parameter, not ${described(selector)}`)
  }
  const [parameter] = selector.parameters
  if (parameter?.kind !== 'parameter') return refused(path, 'an operation selector names its parameter')
  const names: string[] = []
  let current: SyntaxExpression = selector.body
  while (current.kind === 'property-access') {
    names.unshift(current.name)
    current = current.object
  }
  if (current.kind !== 'identifier' || current.name !== parameter.name || names.length === 0) {
    return refused(path, `an operation selector must be a property chain on '${parameter.name}', not ${described(selector.body)}`)
  }
  return read(names)
}

const operationOf = (path: string, opName: string, expression: SyntaxExpression): Step<CompiledOperation> => {
  if (expression.kind !== 'call' || expression.callee.kind !== 'identifier' || expression.callee.name !== opName) {
    return refused(path, `each bound operation must be a call of '${opName}', not ${described(expression)}`)
  }
  const [selector, model, ...extra] = expression.arguments
  if (selector === undefined || model === undefined || extra.length > 0) {
    return refused(path, `'${opName}' takes a selector and a model`)
  }
  const operation = selectorPathOf(path, selector)
  if (operation.kind === 'refused') return operation
  const data = dataOf(path, model)
  if (data.kind === 'refused') return data
  const parsed = parseBindingModel(data.value)
  if (!parsed.success) {
    return {
      kind: 'refused',
      diagnostics: parsed.issues.map(issue => ({
        path,
        message: `the model of '${operation.value.join('.')}' is invalid at '${issue.path.join('.')}': ${issue.message}`,
      })),
    }
  }
  return read({ operation: operation.value, model: parsed.model })
}

const createOf = (path: string, reference: SyntaxExpression): Step<string> => {
  if (reference.kind === 'object') {
    const create = reference.properties.find(property => property.kind === 'property' && property.name === 'create')
    if (create?.kind === 'property' && create.value.kind === 'string') return read(create.value.value)
  }
  return refused(path, "the binding's first argument must be { create: '<the sdk's create export>' }")
}

const bindCallOf = (statements: readonly SyntaxStatement[]): SyntaxExpression | null => {
  for (const statement of statements) {
    if (statement.kind !== 'variable' || statement.initializer.kind !== 'initialized') continue
    const expression = statement.initializer.expression
    if (expression.kind === 'call' && expression.callee.kind === 'identifier' && expression.callee.name === 'bind') return expression
  }
  return null
}

export const compiledBindingOf = (tree: Tree, path: string): Step<CompiledBinding> => {
  const syntax = moduleSyntaxOf(tree, path)
  if (syntax.diagnostics.length > 0) return fromTypeScript(path, syntax.diagnostics)
  const call = bindCallOf(syntax.statements)
  if (call?.kind !== 'call') return refused(path, 'the binding module has no bind(...) call')
  const [reference, define, ...extra] = call.arguments
  if (reference === undefined || define === undefined || extra.length > 0) {
    return refused(path, 'bind takes the sdk reference and the operations')
  }
  const create = createOf(path, reference)
  if (create.kind === 'refused') return create
  const [op] = define.kind === 'arrow' ? define.parameters : []
  if (define.kind !== 'arrow' || define.parameters.length !== 1 || op?.kind !== 'parameter' || define.body.kind !== 'array') {
    return refused(path, "bind's operations must be an arrow of one parameter returning an array")
  }
  const operations = each(define.body.elements.map(element => operationOf(path, op.name, element)))
  return operations.kind === 'read' ? read({ create: create.value, operations: operations.value }) : operations
}
