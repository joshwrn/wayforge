import { Subject } from "./subject"
import type { Json } from "../src/json"
import type { primitive } from "../src/primitive"

export type Transceiver<Signal extends Json.Serializable> = {
	do: (update: Signal) => void
	undo: (update: Signal) => void
	observe: (fn: (update: Signal) => void) => () => void
}

export enum TransceiverMode {
	Record = 0,
	Playback = 1,
}

export type SetUpdate = `add:${string}` | `clear:${string}` | `del:${string}`

export class TransceiverSet<T extends primitive>
	extends Set<T>
	implements Transceiver<SetUpdate>
{
	protected mode: TransceiverMode = TransceiverMode.Record
	protected readonly subject = new Subject()

	public add(value: T): this {
		if (this.mode === TransceiverMode.Record) {
			this.subject.next(`add:${JSON.stringify(value)}`)
		}
		return super.add(value)
	}

	public clear(): void {
		if (this.mode === TransceiverMode.Record) {
			this.subject.next(`clear:${JSON.stringify([...this])}`)
		}
		super.clear()
	}

	public delete(value: T): boolean {
		if (this.mode === TransceiverMode.Record) {
			this.subject.next(`del:${JSON.stringify(value)}`)
		}
		return super.delete(value)
	}

	public observe(fn: (update: SetUpdate) => void): () => void {
		return this.subject.subscribe(fn).unsubscribe
	}

	public do(update: SetUpdate): void {
		const [type, value] = update.split(`:`)
		switch (type) {
			case `add`:
				this.add(JSON.parse(value))
				break
			case `clear`:
				this.clear()
				break
			case `del`:
				this.delete(JSON.parse(value))
				break
		}
	}

	public undo(update: SetUpdate): void {
		const [type, value] = update.split(`:`)
		switch (type) {
			case `add`:
				this.delete(JSON.parse(value))
				break
			case `clear`:
				this.forEach((value) => this.add(value))
				break
			case `del`:
				this.add(JSON.parse(value))
				break
		}
	}
}
