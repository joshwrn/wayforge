import type { Socket } from "socket.io-client"

import { recordToEntries } from "~/packages/anvl/src/object/entries"
import * as A_IO from "~/packages/atom.io/src"

import { DEFAULT_SIMPLE_GIT_RETURN_VALUES } from "./defaults"
import type {
  GitInterface,
  GitClientEvents,
  GitServerEvents,
  GitSocketError,
} from "./interface"

export * from "./interface"

export type GitClientSocket = Socket<GitServerEvents, GitClientEvents>

export type GitClientTools = {
  [GitFunction in keyof GitInterface]: GitInterface[GitFunction] extends (
    ...args: any[]
  ) => any
    ? {
        (...args: Parameters<GitInterface[GitFunction]>): void
        state: A_IO.ReadonlyValueToken<
          Awaited<ReturnType<GitInterface[GitFunction]>> | GitSocketError
        >
        getCurrentState: A_IO.Read<
          () => Awaited<ReturnType<GitInterface[GitFunction]>> | GitSocketError
        >
      }
    : never
}

export const capitalize = (str: string): string =>
  str[0].toUpperCase() + str.slice(1)

export const initGitAtomicTools = (socket: GitClientSocket): GitClientTools => {
  const completeInterface = {} as GitClientTools

  const makeClientInterface = (key: keyof GitInterface) => {
    const state_INTERNAL = A_IO.atom<GitSocketError | any>({
      key: `git${capitalize(key)}_INTERNAL`,
      default: DEFAULT_SIMPLE_GIT_RETURN_VALUES[key],
      effects: [
        ({ setSelf }) => {
          socket.on(key, (result) => {
            setSelf(result)
          })
        },
      ],
    })
    const getCurrentState: A_IO.Read<() => any> = ({ get }) =>
      get(state_INTERNAL)
    const clientInterface = Object.assign(
      (...args: Parameters<GitInterface[keyof GitInterface]>) =>
        socket.emit(key, ...args),
      {
        getCurrentState,
        state: A_IO.selector({
          key: `git${capitalize(key)}`,
          get: ({ get }) => get(state_INTERNAL),
        }),
      }
    )
    return clientInterface
  }
  for (const [key] of recordToEntries(DEFAULT_SIMPLE_GIT_RETURN_VALUES)) {
    completeInterface[key] = makeClientInterface(key)
  }
  return completeInterface
}
