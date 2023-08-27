import * as AtomIO from "atom.io"
import * as React from "react"

import type { Modifier } from "~/packages/anvl/src/function"

import { StoreContext } from "./store-context"

export type StoreHooks = {
	useI: <T>(token: AtomIO.StateToken<T>) => (next: Modifier<T> | T) => void
	useO: <T>(token: AtomIO.ReadonlySelectorToken<T> | AtomIO.StateToken<T>) => T
	useIO: <T>(token: AtomIO.StateToken<T>) => [T, (next: Modifier<T> | T) => void]
}
export const storeHooks: StoreHooks = { useI, useO, useIO }

export function useI<T>(
	token: AtomIO.StateToken<T>,
): (next: Modifier<T> | T) => void {
	const store = React.useContext(StoreContext)
	const update = (next: Modifier<T> | T) => AtomIO.setState(token, next, store)
	return update
}

export function useO<T>(
	token: AtomIO.ReadonlySelectorToken<T> | AtomIO.StateToken<T>,
): T {
	const store = React.useContext(StoreContext)
	const id = React.useId()
	return React.useSyncExternalStore<T>(
		(observe) => AtomIO.subscribe(token, observe, `use-o:${id}`, store),
		() => AtomIO.getState(token, store),
	)
}

export function useIO<T>(
	token: AtomIO.StateToken<T>,
): [T, (next: Modifier<T> | T) => void] {
	return [useO(token), useI(token)]
}

export function useStore<T>(
	token: AtomIO.StateToken<T>,
): [T, (next: Modifier<T> | T) => void]
export function useStore<T>(token: AtomIO.ReadonlySelectorToken<T>): T
export function useStore<T>(
	token: AtomIO.ReadonlySelectorToken<T> | AtomIO.StateToken<T>,
): T | [T, (next: Modifier<T> | T) => void] {
	return token.type === `readonly_selector` ? useO(token) : useIO(token)
}
