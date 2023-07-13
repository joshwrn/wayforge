import * as AtomIO from "atom.io"

import type { ƒn } from "~/packages/anvl/src/function"

import type { ServerConfig } from "."

export const useReceiveTransaction = ({ socket, store }: ServerConfig) => {
	return function receiveTransaction<ƒ extends ƒn>(
		tx: AtomIO.TransactionToken<ƒ>,
	): () => void {
		const fillTransactionRequest = (update: AtomIO.TransactionUpdate<ƒ>) =>
			AtomIO.runTransaction<ƒ>(tx, store)(...update.params)

		socket.on(`tx:${tx.key}`, fillTransactionRequest)

		return () => socket.off(`tx:${tx.key}`, fillTransactionRequest)
	}
}
