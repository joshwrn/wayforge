import type { KeyedStateUpdate, StateUpdate } from "atom.io"

import type { Atom } from "../atom"
import { isTransceiver } from "../mutable"
import type { Store } from "../store"

function shouldUpdateBeStowed(key: string, update: StateUpdate<any>): boolean {
	// do not stow updates that aren't json, unless they're not equal by reference
	if (isTransceiver(update.newValue)) {
		return false
	}
	// do not stow updates where the key contains 👁‍🗨
	if (key.includes(`👁‍🗨`)) {
		return false
	}
	return true
}

export const stowUpdate = <T>(
	state: Atom<T>,
	update: StateUpdate<T>,
	store: Store,
): void => {
	const { key } = state
	const { logger } = store.config
	if (store.transactionStatus.phase !== `building`) {
		store.config.logger?.warn(
			`stowUpdate called outside of a transaction. This is probably a bug.`,
		)
		return
	}
	const shouldStow = shouldUpdateBeStowed(key, update)
	if (!shouldStow) {
		return
	}
	const atomUpdate: KeyedStateUpdate<T> = { key, ...update }
	if (state.family) {
		atomUpdate.family = state.family
	}
	store.transactionStatus.atomUpdates.push(atomUpdate)
	logger?.info(`📝 ${key} stowed (`, update.oldValue, `->`, update.newValue, `)`)
}
