import type { BindingModel } from './model'

export type Operation = (data: never) => unknown

export type FieldOf<O> = O extends (data: infer D) => unknown ? Extract<keyof D, string> : string

export interface BoundOperation<Api> {
  readonly select: (api: Api) => Operation
  readonly model: BindingModel<string>
}

export type Op<Api> = <O extends Operation>(select: (api: Api) => O, model: BindingModel<FieldOf<O>>) => BoundOperation<Api>

export interface SdkReference {
  readonly create: string
}

export interface Binding<Api> {
  readonly sdk: SdkReference
  readonly operations: readonly BoundOperation<Api>[]
}

export const bind = <Api>(sdk: SdkReference, define: (op: Op<Api>) => readonly BoundOperation<Api>[]): Binding<Api> => ({
  sdk,
  operations: define((select, model) => ({ select, model })),
})
