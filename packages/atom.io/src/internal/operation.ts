import type { Atom, ReadonlySelector, Selector } from "."
import { target } from "."
import type { Store } from "./store"
import { IMPLICIT } from "./store"
import type { StateToken } from ".."

export type OperationProgress =
	| {
			open: false
	  }
	| {
			open: true
			done: Set<string>
			prev: Record<string, any>
			time: number
			token: StateToken<any>
	  }

export const openOperation = (token: StateToken<any>, store: Store): void => {
	const core = target(store)
	if (core.operation.open) {
		store.config.logger?.error(
			`❌ failed to setState to "${token.key}" during a setState for "${core.operation.token.key}"`,
		)
		throw Symbol(`violation`)
	}
	core.operation = {
		open: true,
		done: new Set(),
		prev: { ...store.valueMap },
		time: Date.now(),
		token,
	}
	store.config.logger?.info(
		`⭕ operation start from "${token.key}" in store "${store.config.name}"`,
	)
}
export const closeOperation = (store: Store): void => {
	const core = target(store)
	core.operation = { open: false }
	store.config.logger?.info(`🔴 operation done`)
}

export const isDone = (key: string, store: Store = IMPLICIT.STORE): boolean => {
	const core = target(store)
	if (!core.operation.open) {
		store.config.logger?.warn(
			`isDone called outside of an operation. This is probably a bug.`,
		)
		return true
	}
	return core.operation.done.has(key)
}
export const markDone = (key: string, store: Store = IMPLICIT.STORE): void => {
	const core = target(store)
	if (!core.operation.open) {
		store.config.logger?.warn(
			`markDone called outside of an operation. This is probably a bug.`,
		)
		return
	}
	core.operation.done.add(key)
}
export const recallState = <T>(
	state: Atom<T> | ReadonlySelector<T> | Selector<T>,
	store: Store = IMPLICIT.STORE,
): T => {
	const core = target(store)
	if (!core.operation.open) {
		store.config.logger?.warn(
			`recall called outside of an operation. This is probably a bug.`,
		)
		return core.valueMap[state.key]
	}
	return core.operation.prev[state.key]
}

export const cacheValue = (
	key: string,
	value: unknown,
	store: Store = IMPLICIT.STORE,
): void => {
	const core = target(store)
	core.valueMap[key] = value
}

export const evictCachedValue = (
	key: string,
	store: Store = IMPLICIT.STORE,
): void => {
	const core = target(store)
	delete core.valueMap[key]
}
export const readCachedValue = <T>(
	key: string,
	store: Store = IMPLICIT.STORE,
): T => target(store).valueMap[key]

export const isValueCached = (
	key: string,
	store: Store = IMPLICIT.STORE,
): boolean => key in target(store).valueMap

export const storeAtom = (
	atom: Atom<any>,
	store: Store = IMPLICIT.STORE,
): void => {
	const core = target(store)
	core.atoms[atom.key] = atom
}

export const storeSelector = (
	selector: Selector<any>,
	store: Store = IMPLICIT.STORE,
): void => {
	const core = target(store)
	core.selectors[selector.key] = selector
}

export const storeReadonlySelector = (
	selector: ReadonlySelector<any>,
	store: Store = IMPLICIT.STORE,
): void => {
	const core = target(store)
	core.readonlySelectors[selector.key] = selector
}

export const hasKeyBeenUsed = (
	key: string,
	store: Store = IMPLICIT.STORE,
): boolean => {
	const core = target(store)
	return (
		key in core.atoms || key in core.selectors || key in core.readonlySelectors
	)
}
