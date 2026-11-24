export type Operation = (data: never) => unknown

export interface BoundOperation<Api> {
  readonly select: (api: Api) => Operation
  readonly command: readonly string[]
}

export type Op<Api> = (select: (api: Api) => Operation, command: readonly string[]) => BoundOperation<Api>

export interface Binding<Api> {
  readonly operations: readonly BoundOperation<Api>[]
}

export const bind = <Api>(define: (op: Op<Api>) => readonly BoundOperation<Api>[]): Binding<Api> => ({
  operations: define((select, command) => ({ select, command })),
})
