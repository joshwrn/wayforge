import {
	Store,
	createAtom,
	createAtomFamily,
	createMutableAtom,
	createMutableAtomFamily,
	createSelector,
	createSelectorFamily,
	redo__INTERNAL,
	timeline__INTERNAL,
	transaction__INTERNAL,
	undo__INTERNAL,
} from "atom.io/internal"

import type { redo, timeline, undo } from "."
import { getState, setState, subscribe } from "."
import type { atom, atomFamily } from "./atom"
import type { selector, selectorFamily } from "./selector"
import type { transaction } from "./transaction"

export class Silo {
	public store: Store
	public atom: typeof atom
	public atomFamily: typeof atomFamily
	public selector: typeof selector
	public selectorFamily: typeof selectorFamily
	public transaction: typeof transaction
	public timeline: typeof timeline
	public getState: typeof getState
	public setState: typeof setState
	public subscribe: typeof subscribe
	public undo: typeof undo
	public redo: typeof redo
	public constructor(name: string, fromStore: Store | null = null) {
		const s = new Store(name, fromStore)
		this.store = s
		this.atom = (options) => {
			if (`mutable` in options) {
				return createMutableAtom(options, s)
			}
			return createAtom(options, undefined, s)
		}
		this.atomFamily = (options) => {
			if (`mutable` in options) {
				return createMutableAtomFamily(options, s) as any
			}
			return createAtomFamily(options, s)
		}
		this.selector = (options) => createSelector(options, undefined, s) as any
		this.selectorFamily = (options) => createSelectorFamily(options, s) as any
		this.transaction = (options) => transaction__INTERNAL(options, s)
		this.timeline = (options) => timeline__INTERNAL(options, s)
		this.getState = (token) => getState(token, s)
		this.setState = (token, newValue) => setState(token, newValue, s)
		this.subscribe = (token, handler, key) => subscribe(token, handler, key, s)
		this.undo = (token) => undo__INTERNAL(token, s)
		this.redo = (token) => redo__INTERNAL(token, s)
	}
}
