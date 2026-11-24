import type {
  ClassDeclaration,
  ClassMember,
  DataValue,
  Declaration,
  Expression,
  ImportAttribute,
  ImportDeclaration,
  ImportGroup,
  ImportSpecifier,
  Layout,
  ModuleDescription,
  Parameter,
  Statement,
  TypeReference,
} from './description'

const indentUnit = '  '

const pad = (depth: number): string => indentUnit.repeat(depth)

const hex = (code: number, width: number): string => code.toString(16).padStart(width, '0')

const escapedCharacters: Readonly<Record<string, string>> = {
  '\\': '\\\\',
  "'": "\\'",
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
}

const escapeUnit = (unit: string): string => {
  const known = escapedCharacters[unit]
  if (known !== undefined) {
    return known
  }
  const code = unit.charCodeAt(0)
  if (code < 0x20 || code === 0x7f) {
    return `\\x${hex(code, 2)}`
  }
  if (code > 0x7e) {
    return `\\u${hex(code, 4)}`
  }
  return unit
}

const stringLiteral = (text: string): string => {
  const units: string[] = []
  for (let index = 0; index < text.length; index += 1) {
    units.push(escapeUnit(text.charAt(index)))
  }
  return `'${units.join('')}'`
}

const identifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const propertyKey = (key: string): string => (identifierPattern.test(key) ? key : stringLiteral(key))

const numberLiteral = (value: number): string => (Object.is(value, -0) ? '-0' : String(value))

const isDataList = (value: DataValue): value is readonly DataValue[] => Array.isArray(value)

const block = (open: string, entries: readonly string[], close: string, depth: number): string =>
  entries.length === 0
    ? `${open}${close}`
    : `${open}\n${entries.map(entry => `${pad(depth + 1)}${entry},\n`).join('')}${pad(depth)}${close}`

const recordBraces = { open: '{', close: '}', padding: ' ' }

const arrayBrackets = { open: '[', close: ']', padding: '' }

const laidOut = (
  layout: Layout,
  delimiters: { readonly open: string; readonly close: string; readonly padding: string },
  entries: readonly string[],
  depth: number,
): string => {
  if (layout === 'multi-line') {
    return block(delimiters.open, entries, delimiters.close, depth)
  }
  return entries.length === 0
    ? `${delimiters.open}${delimiters.close}`
    : `${delimiters.open}${delimiters.padding}${entries.join(', ')}${delimiters.padding}${delimiters.close}`
}

const entryDepth = (layout: Layout, depth: number): number => (layout === 'multi-line' ? depth + 1 : depth)

const dataLiteral = (value: DataValue, depth: number): string => {
  if (value === null) {
    return 'null'
  }
  if (typeof value === 'string') {
    return stringLiteral(value)
  }
  if (typeof value === 'number') {
    return numberLiteral(value)
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }
  if (isDataList(value)) {
    return block(
      '[',
      value.map(item => dataLiteral(item, depth + 1)),
      ']',
      depth,
    )
  }
  return block(
    '{',
    Object.entries(value).map(([key, item]) => `${propertyKey(key)}: ${dataLiteral(item, depth + 1)}`),
    '}',
    depth,
  )
}

const typeReference = (reference: TypeReference): string =>
  reference.arguments === undefined || reference.arguments.length === 0
    ? reference.name
    : `${reference.name}<${reference.arguments.map(typeReference).join(', ')}>`

const annotation = (reference: TypeReference | undefined): string => (reference === undefined ? '' : `: ${typeReference(reference)}`)

const parameterList = (parameters: readonly Parameter[]): string =>
  `(${parameters.map(parameter => `${parameter.name}${annotation(parameter.type)}`).join(', ')})`

const isStatementList = (body: Expression | readonly Statement[]): body is readonly Statement[] => Array.isArray(body)

const startsWithBrace = (expression: Expression): boolean =>
  expression.kind === 'record' ||
  (expression.kind === 'data' && typeof expression.value === 'object' && expression.value !== null && !isDataList(expression.value))

const operand = (expression: Expression, depth: number): string => {
  const text = expressionText(expression, depth)
  return expression.kind === 'identifier' || expression.kind === 'member' || expression.kind === 'call' || expression.kind === 'this'
    ? text
    : `(${text})`
}

const arrowBody = (body: Expression | readonly Statement[], depth: number): string => {
  if (isStatementList(body)) {
    return statementBlock(body, depth)
  }
  const text = expressionText(body, depth)
  return startsWithBrace(body) ? `(${text})` : text
}

const expressionText = (expression: Expression, depth: number): string => {
  switch (expression.kind) {
    case 'data':
      return dataLiteral(expression.value, depth)
    case 'identifier':
      return expression.name
    case 'member':
      return `${operand(expression.object, depth)}.${expression.property}`
    case 'call':
      return `${operand(expression.callee, depth)}(${expression.arguments.map(argument => expressionText(argument, depth)).join(', ')})`
    case 'await':
      return `await ${operand(expression.expression, depth)}`
    case 'arrow':
      return `${expression.async === true ? 'async ' : ''}${parameterList(expression.parameters)}${annotation(expression.returnType)} => ${arrowBody(expression.body, depth)}`
    case 'record':
      return laidOut(
        expression.layout,
        recordBraces,
        expression.entries.map(entry => `${propertyKey(entry.key)}: ${expressionText(entry.value, entryDepth(expression.layout, depth))}`),
        depth,
      )
    case 'array':
      return laidOut(
        expression.layout,
        arrayBrackets,
        expression.elements.map(element => expressionText(element, entryDepth(expression.layout, depth))),
        depth,
      )
    case 'regexp':
      return `/${expression.pattern}/${expression.flags}`
    case 'this':
      return 'this'
    case 'assign':
      return `${expressionText(expression.target, depth)} = ${expressionText(expression.value, depth)}`
  }
}

const constText = (name: string, type: TypeReference | undefined, value: Expression, depth: number): string =>
  `const ${name}${annotation(type)} = ${expressionText(value, depth)}`

const guardStatementStart = (text: string): string => (text.startsWith('(') || text.startsWith('[') ? `;${text}` : text)

const statementText = (statement: Statement, depth: number): string => {
  switch (statement.kind) {
    case 'return':
      return statement.value === undefined ? 'return' : `return ${expressionText(statement.value, depth)}`
    case 'expression':
      return guardStatementStart(
        startsWithBrace(statement.expression)
          ? `(${expressionText(statement.expression, depth)})`
          : expressionText(statement.expression, depth),
      )
    case 'const':
      return constText(statement.name, statement.type, statement.value, depth)
  }
}

const statementBlock = (statements: readonly Statement[], depth: number): string =>
  statements.length === 0
    ? '{}'
    : `{\n${statements.map(statement => `${pad(depth + 1)}${statementText(statement, depth + 1)}\n`).join('')}${pad(depth)}}`

const exportPrefix = (exported: boolean | undefined): string => (exported === true ? 'export ' : '')

const memberText = (member: ClassMember): string =>
  `${pad(1)}${member.readonly ? 'readonly ' : ''}${propertyKey(member.name)} = ${expressionText(member.value, 1)}\n`

const classText = (declaration: ClassDeclaration): string => {
  const heritage = declaration.extends === null ? '' : ` extends ${operand(declaration.extends, 0)}`
  const body = declaration.members.length === 0 ? '{}' : `{\n${declaration.members.map(memberText).join('')}}`
  return `${exportPrefix(declaration.exported)}class ${declaration.name}${heritage} ${body}`
}

const declarationText = (declaration: Declaration): string => {
  switch (declaration.kind) {
    case 'const':
      return `${exportPrefix(declaration.exported)}${constText(declaration.name, declaration.type, declaration.value, 0)}`
    case 'function':
      return `${exportPrefix(declaration.exported)}${declaration.async === true ? 'async ' : ''}function ${declaration.name}${parameterList(declaration.parameters)}${annotation(declaration.returnType)} ${statementBlock(declaration.body, 0)}`
    case 'class':
      return classText(declaration)
    case 'expression':
      return statementText(declaration, 0)
  }
}

const specifierText = (specifier: ImportSpecifier, wholeTypeOnly: boolean): string =>
  `${specifier.typeOnly === true && !wholeTypeOnly ? 'type ' : ''}${specifier.name}${specifier.alias === undefined ? '' : ` as ${specifier.alias}`}`

const attributesText = (attributes: readonly ImportAttribute[]): string =>
  attributes.length === 0
    ? ''
    : ` with { ${attributes.map(attribute => `${propertyKey(attribute.key)}: ${stringLiteral(attribute.value)}`).join(', ')} }`

const importClause = (declaration: ImportDeclaration, wholeTypeOnly: boolean): string => {
  const bindings: string[] = []
  if (declaration.default.kind === 'default') {
    bindings.push(declaration.default.name)
  }
  if (declaration.names.length > 0) {
    bindings.push(`{ ${declaration.names.map(specifier => specifierText(specifier, wholeTypeOnly)).join(', ')} }`)
  }
  return bindings.join(', ')
}

const importText = (declaration: ImportDeclaration): string => {
  const wholeTypeOnly = declaration.typeOnly === true
  const specifier = `${stringLiteral(declaration.from)}${attributesText(declaration.attributes)}`
  const clause = importClause(declaration, wholeTypeOnly)
  if (clause === '') {
    return `import ${specifier}`
  }
  return `import ${wholeTypeOnly ? 'type ' : ''}${clause} from ${specifier}`
}

const groupText = (group: ImportGroup): string => group.map(importText).join('\n')

const headerText = (header: string): string =>
  header
    .split('\n')
    .map(line => (line === '' ? '//' : `// ${line}`))
    .join('\n')

export const renderModule = (description: ModuleDescription): string => {
  const sections: string[] = []
  if (description.header !== undefined) {
    sections.push(headerText(description.header))
  }
  const groups = description.imports.filter(group => group.length > 0)
  if (groups.length > 0) {
    sections.push(groups.map(groupText).join('\n\n'))
  }
  for (const declaration of description.declarations ?? []) {
    sections.push(declarationText(declaration))
  }
  return `${sections.join('\n\n')}\n`
}
