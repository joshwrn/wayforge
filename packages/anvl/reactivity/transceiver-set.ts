import type { Stringified } from "../src/json"
import { parseJson, stringifyJson } from "../src/json"
import { a } from "../src/json-schema"
import type { primitive } from "../src/primitive"
import { Subject } from "./subject"
import type { Transceiver, TransceiverMode } from "./transceiver"

export type SetUpdate =
	| `add:${string}`
	| `clear:${string}`
	| `del:${string}`
	| `tx:${string}`
export type NumberedSetUpdate = `${number}=${SetUpdate}`

export class TransceiverSet<P extends primitive>
	extends Set<P>
	implements Transceiver<NumberedSetUpdate>
{
	public mode: TransceiverMode = `record`
	public readonly subject = new Subject<SetUpdate>()
	public cacheLimit = 0
	public cache: (NumberedSetUpdate | undefined)[] = []
	public cacheIdx = -1
	public cacheUpdateNumber = -1

	public constructor(values?: readonly P[] | null | Set<P>, cacheLimit = 0) {
		super(values)
		if (values instanceof TransceiverSet) {
			this.parent = values
			this.cacheUpdateNumber = values.cacheUpdateNumber
		}
		if (cacheLimit) {
			this.cacheLimit = cacheLimit
			this.cache = new Array(cacheLimit)
			this.subscribe(`auto cache`, (update) => {
				this.cacheIdx++
				this.cache[this.cacheIdx] = update
				this.cacheIdx %= this.cacheLimit
				console.log(`cache`, update, this.cache)
			})
		}
	}

	public add(value: P): this {
		if (this.mode === `record`) {
			this.cacheUpdateNumber++
			console.log(`inc`, this.cacheUpdateNumber)
			this.emit(`add:${stringifyJson<P>(value)}`)
		}
		return super.add(value)
	}

	public clear(): void {
		if (this.mode === `record`) {
			this.cacheUpdateNumber++
			this.emit(`clear:${JSON.stringify([...this])}`)
		}
		super.clear()
	}

	public delete(value: P): boolean {
		if (this.mode === `record`) {
			this.cacheUpdateNumber++
			this.emit(`del:${stringifyJson<P>(value)}`)
		}
		return super.delete(value)
	}

	// TRANSACTIONS
	public readonly parent: TransceiverSet<P> | null
	public child: TransceiverSet<P> | null = null
	public transactionUpdates: SetUpdate[] | null = null
	public transaction(run: (child: TransceiverSet<P>) => boolean): void {
		this.mode = `transaction`
		this.transactionUpdates = []
		this.child = new TransceiverSet(this)
		const unsubscribe = this.child._subscribe(`transaction`, (update) => {
			this.transactionUpdates?.push(update)
		})
		try {
			const shouldCommit = run(this.child)
			if (shouldCommit) {
				this.cacheUpdateNumber++
				this.emit(`tx:${this.transactionUpdates.join(`;`)}`)
				for (const update of this.transactionUpdates) {
					this.doStep(update)
				}
			}
		} catch (thrown) {
			console.error(`Failed to apply transaction: ${thrown}`)
		} finally {
			unsubscribe()
			this.child = null
			this.transactionUpdates = null
			this.mode = `record`
		}
	}

	protected _subscribe(key: string, fn: (update: SetUpdate) => void) {
		return this.subject.subscribe(key, fn)
	}
	public subscribe(
		key: string,
		fn: (update: NumberedSetUpdate) => void,
	): () => void {
		return this.subject.subscribe(key, (update) =>
			fn(`${this.cacheUpdateNumber}=${update}`),
		)
	}

	public emit(update: SetUpdate): void {
		this.subject.next(update)
	}

	private doStep(update: SetUpdate): void {
		const typeValueBreak = update.indexOf(`:`)
		const type = update.substring(0, typeValueBreak)
		const value = update.substring(typeValueBreak + 1)
		switch (type) {
			case `add`:
				this.add(parseJson(value as Stringified<P>))
				break
			case `clear`:
				this.clear()
				break
			case `del`:
				this.delete(parseJson(value as Stringified<P>))
				break
			case `tx`:
				for (const update of value.split(`;`)) {
					this.doStep(update as SetUpdate)
				}
		}
	}

	public do(update: NumberedSetUpdate): null | number | `OUT_OF_RANGE` {
		const breakpoint = update.indexOf(`=`)
		const updateNumber = Number(update.substring(0, breakpoint))
		const eventOffset = updateNumber - this.cacheUpdateNumber
		const isFuture = eventOffset > 0
		console.log({
			updateNumber,
			cacheUpdateNumber: this.cacheUpdateNumber,
			eventOffset,
			isFuture,
		})
		if (isFuture) {
			if (eventOffset === 1) {
				this.mode = `playback`
				const innerUpdate = update.substring(breakpoint + 1) as SetUpdate
				this.doStep(innerUpdate)
				this.mode = `record`
				this.cacheUpdateNumber = updateNumber
				return null
			}
			return this.cacheUpdateNumber + 1
		} else {
			if (Math.abs(eventOffset) < this.cacheLimit) {
				const eventIdx = this.cacheIdx + eventOffset
				const cachedUpdate = this.cache[eventIdx]
				if (cachedUpdate === update) {
					console.log(`no-op`)
					return null
				}
				this.mode = `playback`
				let done = false
				console.log({ eventIdx, cachedUpdate, update })
				while (!done) {
					this.cacheIdx %= this.cacheLimit
					const update = this.cache[this.cacheIdx]
					this.cacheIdx--
					if (!update) {
						return `OUT_OF_RANGE`
					}
					const undoRes = this.undo(update)
					done = this.cacheIdx === eventIdx - 1
					console.log(`-`, { update, done, undoRes })
				}
				const innerUpdate = update.substring(breakpoint + 1) as SetUpdate
				this.doStep(innerUpdate)
				this.mode = `record`
				this.cacheUpdateNumber = updateNumber
				return null
			} else {
				return `OUT_OF_RANGE`
			}
		}
	}

	public undoStep(update: SetUpdate): void {
		const breakpoint = update.indexOf(`:`)
		const type = update.substring(0, breakpoint)
		const value = update.substring(breakpoint + 1)
		switch (type) {
			case `add`:
				this.delete(parseJson(value as Stringified<P>))
				break
			case `del`:
				this.add(parseJson(value as Stringified<P>))
				break
			case `clear`: {
				const values = JSON.parse(value) as P[]
				for (const value of values) this.add(value)
				break
			}
			case `tx`: {
				const updates = value.split(`;`) as SetUpdate[]
				for (let i = updates.length - 1; i >= 0; i--) {
					this.undoStep(updates[i])
				}
			}
		}
	}

	public undo(update: NumberedSetUpdate): null | number {
		const breakpoint = update.indexOf(`=`)
		const updateNumber = Number(update.substring(0, breakpoint))
		if (updateNumber === this.cacheUpdateNumber) {
			this.mode = `playback`
			const innerUpdate = update.substring(breakpoint + 1) as SetUpdate
			this.undoStep(innerUpdate)
			this.mode = `record`
			this.cacheUpdateNumber--
			return null
		}
		return this.cacheUpdateNumber
	}
}
