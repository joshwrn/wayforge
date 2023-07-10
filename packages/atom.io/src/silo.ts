import type { timeline } from "."
import { getState, setState, subscribe } from "."
import type { atom, atomFamily } from "./atom"
import type { Store } from "./internal"
import {
  atomFamily__INTERNAL,
  atom__INTERNAL,
  createStore,
  selectorFamily__INTERNAL,
  selector__INTERNAL,
  timeline__INTERNAL,
  transaction__INTERNAL,
} from "./internal"
import type { selector, selectorFamily } from "./selector"
import type { transaction } from "./transaction"

export type Silo = ReturnType<typeof silo>

export const silo = (
  name: string,
  fromStore: Store | null = null
): {
  store: Store
  atom: typeof atom
  atomFamily: typeof atomFamily
  selector: typeof selector
  selectorFamily: typeof selectorFamily
  transaction: typeof transaction
  timeline: typeof timeline
  getState: typeof getState
  setState: typeof setState
  subscribe: typeof subscribe
} => {
  const store = createStore(name, fromStore)
  return {
    store,
    atom: (options) => atom__INTERNAL(options, undefined, store),
    atomFamily: (options) => atomFamily__INTERNAL(options, store),
    selector: (options) => selector__INTERNAL(options, undefined, store) as any,
    selectorFamily: (options) => selectorFamily__INTERNAL(options, store) as any,
    transaction: (options) => transaction__INTERNAL(options, store),
    timeline: (options) => timeline__INTERNAL(options, store),
    getState: (token) => getState(token, store),
    setState: (token, newValue) => setState(token, newValue, store),
    subscribe: (token, handler) => subscribe(token, handler, store),
  }
}
