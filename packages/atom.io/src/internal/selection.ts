import HAMT from "hamt_plus"

import type { Atom, ReadonlySelector, Selector } from "."
import type { Store } from "./store"
import { IMPLICIT } from "./store"
import type { ReadonlyValueToken, SelectorToken, StateToken } from ".."

export const startSelection = (
  token: ReadonlyValueToken<any> | SelectorToken<any>,
  store: Store
): void => {
  store.selection = {
    open: true,
    route: [token.key],
    paths: { [token.key]: { notDone: [[token.key]], done: [] } },
  }
  store.config.logger?.info(`☐`, `operation start`)
}
export const extendSelection = (key: string, store: Store): void => {
  store.selection = {
    open: true,
    route: [...store.selection.route, key],
    paths: [...store.selection.paths, []],
  }
  store.config.logger?.info(`☐`, `operation start`)
}
