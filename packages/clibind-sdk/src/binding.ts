import type { BindingModel, GlobalOption } from './model'

export type Operation = (data: never) => unknown

export type FieldOf<O> = O extends (data: infer D) => unknown ? Extract<keyof D, string> : string

export interface BoundOperation<Api> {
  readonly select: (api: Api) => Operation
  readonly model: BindingModel<string>
}

export type Op<Api> = <O extends Operation>(select: (api: Api) => O, model: BindingModel<FieldOf<O>>) => BoundOperation<Api>

export type GlobalOptions<Config> = { readonly [F in keyof Config]-?: GlobalOption<Extract<F, string>> }

export interface SdkReference<Config> {
  readonly create: string
  readonly globals: GlobalOptions<Config>
}

export interface Binding<Api, Config> {
  readonly sdk: SdkReference<Config>
  readonly operations: readonly BoundOperation<Api>[]
}

export const bind = <Api, Config>(
  sdk: SdkReference<Config>,
  define: (op: Op<Api>) => readonly BoundOperation<Api>[],
): Binding<Api, Config> => ({
  sdk,
  operations: define((select, model) => ({ select, model })),
})
