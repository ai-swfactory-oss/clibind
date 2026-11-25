import type { Tree } from '@ai-swfactory-oss/files'
import {
  moduleSyntaxOf,
  type SyntaxStatement,
  type SyntaxTypeMember,
  type SyntaxTypeNode,
  type SyntaxVariable,
} from '@ai-swfactory-oss/typescript'

import { nearestManifestOf } from './compile-manifest'
import { each, fromTypeScript, read, refused, type Step } from './compile-step'

export interface CompiledSdk {
  readonly packageName: string
  readonly create: string
  readonly ports: readonly string[]
}

const TYPE_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/

const packageNameOf = (tree: Tree, sdkPath: string): Step<string> => {
  const manifest = nearestManifestOf(tree, sdkPath)
  if (manifest === null) return refused(sdkPath, 'the sdk has no package.json at or above its path')
  const name = manifest.fields.name
  return typeof name === 'string' ? read(name) : refused(manifest.path, "the sdk's package.json names no package")
}

type Declarations = ReadonlyMap<string, SyntaxStatement>

const declarationsOf = (statements: readonly SyntaxStatement[]): Declarations => {
  const declarations = new Map<string, SyntaxStatement>()
  for (const statement of statements) {
    if (statement.kind === 'interface' || statement.kind === 'type-alias') declarations.set(statement.name, statement)
  }
  return declarations
}

const resolvedType = (declarations: Declarations, type: SyntaxTypeNode): SyntaxTypeNode => {
  if (type.kind !== 'text' || !TYPE_NAME.test(type.text)) return type
  const declared = declarations.get(type.text)
  return declared?.kind === 'type-alias' ? resolvedType(declarations, declared.type) : type
}

const membersOf = (declarations: Declarations, type: SyntaxTypeNode): readonly SyntaxTypeMember[] | null => {
  const resolved = resolvedType(declarations, type)
  if (resolved.kind === 'object') return resolved.members
  if (resolved.kind !== 'text') return null
  const declared = declarations.get(resolved.text)
  return declared?.kind === 'interface' ? declared.properties : null
}

const portsMemberOf = (declarations: Declarations, create: SyntaxVariable): SyntaxTypeMember | null => {
  if (create.type.kind !== 'annotated') return null
  const type = resolvedType(declarations, { kind: 'text', text: create.type.text })
  if (type.kind !== 'function') return null
  for (const parameter of type.parameters) {
    if (parameter.kind !== 'parameter') continue
    const ports = (membersOf(declarations, parameter.type) ?? []).find(member => member.kind === 'property' && member.name === 'ports')
    if (ports !== undefined) return ports
  }
  return null
}

const portNamesOf = (sdkPath: string, declarations: Declarations, ports: SyntaxTypeMember): Step<readonly string[]> => {
  const members = ports.kind === 'property' ? membersOf(declarations, ports.type) : null
  if (members === null) return refused(sdkPath, "the type of create's ports is not readable as an object type")
  return each(
    members.map(
      (member): Step<string> =>
        member.kind === 'property' ? read(member.name) : refused(sdkPath, `the ports type holds '${member.syntax}', which is not a port`),
    ),
  )
}

export const compiledSdkOf = (tree: Tree, sdkPath: string, create: string): Step<CompiledSdk> => {
  const packageName = packageNameOf(tree, sdkPath)
  if (packageName.kind === 'refused') return packageName
  const syntax = moduleSyntaxOf(tree, sdkPath)
  if (syntax.diagnostics.length > 0) return fromTypeScript(sdkPath, syntax.diagnostics)
  const exported = syntax.statements.find(statement => statement.kind === 'variable' && statement.exported && statement.name === create)
  if (exported?.kind !== 'variable') return refused(sdkPath, `the sdk has no export named '${create}'`)
  const declarations = declarationsOf(syntax.statements)
  const ports = portsMemberOf(declarations, exported)
  if (ports === null) {
    return refused(sdkPath, `the sdk's export '${create}' is not a create function taking { ports }`)
  }
  const names = portNamesOf(sdkPath, declarations, ports)
  return names.kind === 'read' ? read({ packageName: packageName.value, create, ports: names.value }) : names
}
