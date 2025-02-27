import { vitest } from "vitest"

import {
	atom,
	atomFamily,
	getState,
	redo,
	runTransaction,
	selector,
	setLogLevel,
	setState,
	subscribe,
	subscribeToTimeline,
	timeline,
	transaction,
	undo,
} from "atom.io"
import * as __INTERNAL__ from "atom.io/internal"
import * as UTIL from "./__util__"

const LOG_LEVELS = [null, `error`, `warn`, `info`] as const
const CHOOSE = 0
setLogLevel(LOG_LEVELS[CHOOSE])
const logger = __INTERNAL__.IMPLICIT.STORE.config.logger ?? console

beforeEach(() => {
	__INTERNAL__.clearStore()
	vitest.spyOn(logger, `error`)
	vitest.spyOn(logger, `warn`)
	vitest.spyOn(logger, `info`)
	vitest.spyOn(UTIL, `stdout`)
})

describe(`timeline`, () => {
	it(`tracks the state of a group of atoms`, () => {
		const a = atom({
			key: `a`,
			default: 5,
		})
		const b = atom({
			key: `b`,
			default: 0,
		})
		const c = atom({
			key: `c`,
			default: 0,
		})

		const product_abc = selector({
			key: `product of a, b, & c`,
			get: ({ get }) => {
				return get(a) * get(b) * get(c)
			},
		})

		const tl_abc = timeline({
			key: `a, b, & c`,
			atoms: [a, b, c],
		})

		const tx_ab = transaction<() => void>({
			key: `increment a & b`,
			do: ({ set }) => {
				set(a, (n) => n + 1)
				set(b, (n) => n + 1)
			},
		})

		const tx_bc = transaction<(plus: number) => void>({
			key: `increment b & c`,
			do: ({ set }, add = 1) => {
				set(b, (n) => n + add)
				set(c, (n) => n + add)
			},
		})

		subscribeToTimeline(tl_abc, (update) => console.error(update))

		const expectation0 = () => {
			expect(getState(a)).toBe(5)
			expect(getState(b)).toBe(0)
			expect(getState(c)).toBe(0)
			expect(getState(product_abc)).toBe(0)
		}
		expectation0()

		setState(a, 1)
		const expectation1 = () => {
			expect(getState(a)).toBe(1)
			expect(getState(b)).toBe(0)
			expect(getState(c)).toBe(0)
			expect(getState(product_abc)).toBe(0)
		}
		expectation1()

		runTransaction(tx_ab)()
		const expectation2 = () => {
			expect(getState(a)).toBe(2)
			expect(getState(b)).toBe(1)
			expect(getState(c)).toBe(0)
			expect(getState(product_abc)).toBe(0)
		}
		expectation2()

		runTransaction(tx_bc)(2)
		const expectation3 = () => {
			expect(getState(a)).toBe(2)
			expect(getState(b)).toBe(3)
			expect(getState(c)).toBe(2)
		}
		expectation3()

		undo(tl_abc)
		expectation2()

		redo(tl_abc)
		expectation3()

		undo(tl_abc)
		undo(tl_abc)
		expectation1()

		undo(tl_abc)
		expectation0()

		const timelineData = __INTERNAL__.IMPLICIT.STORE.timelines.get(tl_abc.key)

		if (!timelineData) throw new Error(`timeline data not found`)

		expect(timelineData.at).toBe(0)
		expect(timelineData.history.length).toBe(3)
	})
	test(`subscriptions when time-traveling`, () => {
		const a = atom({
			key: `a`,
			default: 3,
		})
		const b = atom({
			key: `b`,
			default: 6,
		})

		const product_ab = selector({
			key: `product of a & b`,
			get: ({ get }) => {
				return get(a) * get(b)
			},
			set: ({ set }, value) => {
				set(a, Math.sqrt(value))
				set(b, Math.sqrt(value))
			},
		})

		const timeline_ab = timeline({
			key: `a & b`,
			atoms: [a, b],
		})

		subscribe(a, UTIL.stdout)

		setState(product_ab, 1)
		undo(timeline_ab)

		expect(getState(a)).toBe(3)

		expect(UTIL.stdout).toHaveBeenCalledWith({ oldValue: 3, newValue: 1 })
		expect(UTIL.stdout).toHaveBeenCalledWith({ oldValue: 1, newValue: 3 })
	})
	test(`history erasure from the past`, () => {
		const nameState = atom<string>({
			key: `name`,
			default: `josie`,
		})
		const nameCapitalizedState = selector<string>({
			key: `name_capitalized`,
			get: ({ get }) => {
				return get(nameState).toUpperCase()
			},
			set: ({ set }, value) => {
				set(nameState, value.toLowerCase())
			},
		})
		const setName = transaction<(s: string) => void>({
			key: `set name`,
			do: ({ set }, name) => {
				set(nameCapitalizedState, name)
			},
		})

		const nameHistory = timeline({
			key: `name history`,
			atoms: [nameState],
		})

		expect(getState(nameState)).toBe(`josie`)

		setState(nameState, `vance`)
		setState(nameCapitalizedState, `JON`)
		runTransaction(setName)(`Sylvia`)

		const timelineData = __INTERNAL__.IMPLICIT.STORE.timelines.get(
			nameHistory.key,
		)

		if (!timelineData) throw new Error(`timeline data not found`)

		expect(getState(nameState)).toBe(`sylvia`)
		expect(timelineData.at).toBe(3)
		expect(timelineData.history.length).toBe(3)

		undo(nameHistory)
		expect(getState(nameState)).toBe(`jon`)
		expect(timelineData.at).toBe(2)
		expect(timelineData.history.length).toBe(3)

		undo(nameHistory)
		expect(getState(nameState)).toBe(`vance`)
		expect(timelineData.at).toBe(1)
		expect(timelineData.history.length).toBe(3)

		undo(nameHistory)
		expect(getState(nameState)).toBe(`josie`)
		expect(timelineData.at).toBe(0)
		expect(timelineData.history.length).toBe(3)

		runTransaction(setName)(`Mr. Jason Gold`)

		expect(getState(nameState)).toBe(`mr. jason gold`)
		expect(timelineData.at).toBe(1)
		expect(timelineData.history.length).toBe(1)
	})
	it(`adds members of a family already created`, () => {
		const findCountState = atomFamily<number, string>({
			key: `find count`,
			default: 0,
		})
		const myCountState = findCountState(`foo`)
		const countsTL = timeline({
			key: `counts`,
			atoms: [findCountState],
		})
		expect(getState(myCountState)).toBe(0)
		setState(myCountState, 1)
		expect(getState(myCountState)).toBe(1)
		undo(countsTL)
		expect(getState(myCountState)).toBe(0)
	})
	it(`may ignore atom updates conditionally`, () => {
		const count = atom({
			key: `count`,
			default: 0,
		})

		const countTL = timeline({
			key: `count`,
			atoms: [count],
			shouldCapture: (update) => {
				if (update.type === `atom_update`) {
					const atomKey = update.key
					const atomDefault =
						__INTERNAL__.IMPLICIT.STORE.atoms.get(atomKey)?.default
					if (atomDefault === update.oldValue) {
						return false
					}
				}
				return true
			},
		})
		expect(getState(count)).toBe(0)
		setState(count, 1)
		expect(getState(count)).toBe(1)
		undo(countTL)
		expect(getState(count)).toBe(1)
		expect(__INTERNAL__.IMPLICIT.STORE.timelines.get(countTL.key)?.at).toBe(0)
		setState(count, 2)
		expect(getState(count)).toBe(2)
		expect(__INTERNAL__.IMPLICIT.STORE.timelines.get(countTL.key)?.at).toBe(1)
		undo(countTL)
		expect(getState(count)).toBe(1)
		expect(__INTERNAL__.IMPLICIT.STORE.timelines.get(countTL.key)?.at).toBe(0)
	})
})
