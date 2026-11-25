import { z } from 'zod'

import { EXIT_TABLE } from './exits'
import type { BindingModel, GlobalOption, InputArg, RejectedModel } from './model'

const OPENCLI_VERSION = '0.1'

export interface OpenCliArgument {
  readonly name: string
  readonly required: boolean
}

export interface OpenCliOption {
  readonly name: string
  readonly required: boolean
  readonly arguments: readonly OpenCliArgument[]
}

export interface OpenCliCommand {
  readonly name: string
  readonly options: readonly OpenCliOption[]
  readonly arguments: readonly OpenCliArgument[]
  readonly commands: readonly OpenCliCommand[]
}

export interface OpenCliExitCode {
  readonly code: number
  readonly description: string
}

export interface OpenCliRootCommand extends OpenCliCommand {
  readonly exitCodes: readonly OpenCliExitCode[]
}

export interface OpenCliTemplate {
  readonly opencli: string
  readonly info: { readonly title: string }
  readonly command: OpenCliRootCommand
}

export interface OpenCliDocument {
  readonly opencli: string
  readonly info: { readonly title: string; readonly version: string }
  readonly command: OpenCliRootCommand
}

export type OpenCliTemplateRead = { readonly success: true; readonly template: OpenCliTemplate } | RejectedModel

interface CommandNode {
  readonly name: string
  options: readonly OpenCliOption[]
  arguments: readonly OpenCliArgument[]
  readonly children: Map<string, CommandNode>
}

const node = (name: string): CommandNode => ({ name, options: [], arguments: [], children: new Map() })

const optionOf = (arg: InputArg<string>): readonly OpenCliOption[] => {
  switch (arg.kind) {
    case 'positional':
      return []
    case 'option':
      return [{ name: arg.flag, required: true, arguments: [{ name: arg.field, required: true }] }]
    case 'switch':
      return [{ name: arg.flag, required: false, arguments: [] }]
  }
}

const argumentOf = (arg: InputArg<string>): readonly OpenCliArgument[] =>
  arg.kind === 'positional' ? [{ name: arg.field, required: true }] : []

const childOf = (parent: CommandNode, name: string): CommandNode => {
  const known = parent.children.get(name)
  if (known !== undefined) return known
  const created = node(name)
  parent.children.set(name, created)
  return created
}

const commandOf = (tree: CommandNode): OpenCliCommand => ({
  name: tree.name,
  options: tree.options,
  arguments: tree.arguments,
  commands: [...tree.children.values()].map(commandOf),
})

const globalOptionOf = (option: GlobalOption<string>): OpenCliOption => ({
  name: option.flag,
  required: false,
  arguments: [{ name: option.field, required: true }],
})

export const openCliTemplateOf = (
  root: string,
  globals: readonly GlobalOption<string>[],
  operations: readonly BindingModel<string>[],
): OpenCliTemplate => {
  const tree = node(root)
  for (const operation of operations) {
    const leaf = operation.command.reduce(childOf, tree)
    leaf.options = operation.input.flatMap(optionOf)
    leaf.arguments = operation.input.flatMap(argumentOf)
  }
  return {
    opencli: OPENCLI_VERSION,
    info: { title: root },
    command: {
      ...commandOf(tree),
      options: globals.map(globalOptionOf),
      exitCodes: EXIT_TABLE.map(row => ({ code: row.code, description: row.outcome })),
    },
  }
}

export const openCliDocument = (template: OpenCliTemplate, version: string): OpenCliDocument => ({
  opencli: template.opencli,
  info: { title: template.info.title, version },
  command: template.command,
})

const argumentSchema = z.strictObject({ name: z.string().min(1), required: z.boolean() })

const optionSchema = z.strictObject({ name: z.string().min(1), required: z.boolean(), arguments: z.array(argumentSchema) })

const commandSchema: z.ZodType<OpenCliCommand> = z.lazy(() =>
  z.strictObject({
    name: z.string().min(1),
    options: z.array(optionSchema),
    arguments: z.array(argumentSchema),
    commands: z.array(commandSchema),
  }),
)

const templateSchema = z.strictObject({
  opencli: z.string().min(1),
  info: z.strictObject({ title: z.string().min(1) }),
  command: z.strictObject({
    name: z.string().min(1),
    options: z.array(optionSchema),
    arguments: z.array(argumentSchema),
    commands: z.array(commandSchema),
    exitCodes: z.array(z.strictObject({ code: z.number().int(), description: z.string() })),
  }),
})

export const parseOpenCliTemplate = (data: unknown): OpenCliTemplateRead => {
  const result = templateSchema.safeParse(data)
  if (result.success) return { success: true, template: result.data }
  return {
    success: false,
    issues: result.error.issues.map(issue => ({ path: issue.path.map(key => String(key)), message: issue.message })),
  }
}
