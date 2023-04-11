import { IMPLICIT } from "./internal"
import { withdraw, getState__INTERNAL } from "./internal/get"
import { finishAction, startAction } from "./internal/operation"
import { setState__INTERNAL } from "./internal/set"
import type { Store } from "./internal/store"

export * from "./atom"
export * from "./selector"
export * from "./transaction"

export interface AtomToken<_> {
  key: string
  type: `atom`
}
export interface SelectorToken<_> {
  key: string
  type: `selector`
}
export type StateToken<T> = AtomToken<T> | SelectorToken<T>

export interface ReadonlyValueToken<_> {
  key: string
  type: `readonly_selector`
}

export const getState = <T>(
  token: ReadonlyValueToken<T> | StateToken<T>,
  store: Store = IMPLICIT.STORE
): T => {
  const state = withdraw<T>(token, store)
  return getState__INTERNAL(state, store)
}

export const setState = <State, Value extends State>(
  state: StateToken<State>,
  value: Value | ((oldValue: State) => Value),
  store: Store = IMPLICIT.STORE
): void => {
  startAction(store)
  setState__INTERNAL(state, value, store)
  finishAction(store)
}

export const subscribe = <T>(
  token: ReadonlyValueToken<T> | StateToken<T>,
  callback: (update: { newValue: T; oldValue: T }) => void,
  store: Store = IMPLICIT.STORE
): (() => void) => {
  const state = withdraw<T>(token, store)
  const subscription = state.subject.subscribe(callback)
  return () => subscription.unsubscribe()
}
