import { z } from 'zod'

export type Parser = 'lines' | 'json' | 'porcelain-v2' | 'exit-code'

export const PARSERS: readonly [Parser, ...Parser[]] = ['lines', 'json', 'porcelain-v2', 'exit-code']

export type ScalarType = 'string' | 'number'

export interface PositionalArg<F extends string> {
  readonly kind: 'positional'
  readonly field: F
  readonly type: ScalarType
}

export interface OptionArg<F extends string> {
  readonly kind: 'option'
  readonly flag: string
  readonly field: F
  readonly type: ScalarType
}

export interface SwitchArg<F extends string> {
  readonly kind: 'switch'
  readonly flag: string
  readonly field: F
}

export type InputArg<F extends string> = PositionalArg<F> | OptionArg<F> | SwitchArg<F>

export interface OutputModel {
  readonly parser: Parser
}

export interface BindingModel<F extends string> {
  readonly command: readonly string[]
  readonly input: readonly InputArg<F>[]
  readonly output: OutputModel
}

export type ArgValue = string | number | boolean

const wordsOf = (arg: InputArg<string>, value: ArgValue): readonly string[] => {
  switch (arg.kind) {
    case 'positional':
      return [String(value)]
    case 'option':
      return [arg.flag, String(value)]
    case 'switch':
      return value === true ? [arg.flag] : []
  }
}

export const argvOf = <F extends string>(model: BindingModel<F>, input: Readonly<Record<F, ArgValue>>): readonly string[] => [
  ...model.command,
  ...model.input.flatMap(arg => wordsOf(arg, input[arg.field])),
]

const FLAG = /^--?[A-Za-z0-9][-A-Za-z0-9]*$/

const bindingModelSchema = () =>
  z.strictObject({
    command: z.array(z.string().min(1)),
    input: z.array(
      z.discriminatedUnion('kind', [
        z.strictObject({ kind: z.literal('positional'), field: z.string().min(1), type: z.enum(['string', 'number']) }),
        z.strictObject({
          kind: z.literal('option'),
          flag: z.string().regex(FLAG),
          field: z.string().min(1),
          type: z.enum(['string', 'number']),
        }),
        z.strictObject({ kind: z.literal('switch'), flag: z.string().regex(FLAG), field: z.string().min(1) }),
      ]),
    ),
    output: z.strictObject({ parser: z.enum(PARSERS) }),
  })

export interface ModelIssue {
  readonly path: readonly string[]
  readonly message: string
}

export interface AcceptedModel {
  readonly success: true
  readonly model: BindingModel<string>
}

export interface RejectedModel {
  readonly success: false
  readonly issues: readonly ModelIssue[]
}

export const parseBindingModel = (data: unknown): AcceptedModel | RejectedModel => {
  const result = bindingModelSchema().safeParse(data)
  if (result.success) return { success: true, model: result.data }
  return {
    success: false,
    issues: result.error.issues.map(issue => ({ path: issue.path.map(key => String(key)), message: issue.message })),
  }
}

export const bindingModelJsonSchema = (): z.core.JSONSchema.JSONSchema => z.toJSONSchema(bindingModelSchema())
