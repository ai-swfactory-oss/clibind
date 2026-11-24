import type { BindingModel } from './model'

export type Operation = (data: never) => unknown

export type FieldOf<O> = O extends (data: infer D) => unknown ? Extract<keyof D, string> : string

export interface BoundOperation<Api> {
  readonly select: (api: Api) => Operation
  readonly model: BindingModel<string>
}

export type Op<Api> = <O extends Operation>(select: (api: Api) => O, model: BindingModel<FieldOf<O>>) => BoundOperation<Api>

export interface Binding<Api> {
  readonly operations: readonly BoundOperation<Api>[]
}

export const bind = <Api>(define: (op: Op<Api>) => readonly BoundOperation<Api>[]): Binding<Api> => ({
  operations: define((select, model) => ({ select, model })),
})
