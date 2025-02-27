import { vitest } from "vitest"

import {
	atomFamily,
	getState,
	selectorFamily,
	setLogLevel,
	setState,
} from "atom.io"
import * as __INTERNAL__ from "atom.io/internal"

const LOG_LEVELS = [null, `error`, `warn`, `info`] as const
const CHOOSE = 1
setLogLevel(LOG_LEVELS[CHOOSE])
const logger = __INTERNAL__.IMPLICIT.STORE.config.logger ?? console

beforeEach(() => {
	__INTERNAL__.clearStore()
	vitest.spyOn(logger, `error`)
	vitest.spyOn(logger, `warn`)
	vitest.spyOn(logger, `info`)
})

describe(`atom families`, () => {
	it(`can be modified and retrieved`, () => {
		const findCoordinateState = atomFamily<{ x: number; y: number }, string>({
			key: `coordinate`,
			default: { x: 0, y: 0 },
		})
		setState(findCoordinateState(`a`), { x: 1, y: 1 })
		expect(getState(findCoordinateState(`a`))).toEqual({ x: 1, y: 1 })
	})
})

describe(`selector families`, () => {
	it(`can be modified and retrieved`, () => {
		const findPointState = atomFamily<{ x: number; y: number }, string>({
			key: `point`,
			default: { x: 0, y: 0 },
		})
		const findDistanceState = selectorFamily<number, [string, string]>({
			key: `distance`,
			get:
				([keyA, keyB]) =>
				({ get }) => {
					const pointA = get(findPointState(keyA))
					const pointB = get(findPointState(keyB))
					return Math.sqrt(
						(pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2,
					)
				},
		})
		setState(findPointState(`a`), { x: 1, y: 1 })
		setState(findPointState(`b`), { x: 2, y: 2 })
		expect(getState(findDistanceState([`a`, `b`]))).toBe(1.4142135623730951)

		setState(findPointState(`b`), { x: 11, y: 11 })
		expect(getState(findDistanceState([`a`, `b`]))).toBe(14.142135623730951)
	})
})
