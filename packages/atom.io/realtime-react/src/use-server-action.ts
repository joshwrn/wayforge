import * as AtomIO from "atom.io"
import { StoreContext } from "atom.io/react"
import * as React from "react"
import type { Socket } from "socket.io-client"

import { RealtimeContext } from "./realtime-context"

const TX_SUBS = new Map<string, number>()
export function synchronizeTransactionResults(
	token: AtomIO.TransactionToken<any>,
	socket: Socket,
	store: AtomIO.Store,
): () => void {
	const count = TX_SUBS.get(token.key) ?? 0
	TX_SUBS.set(token.key, count + 1)
	const unsubscribe =
		count === 0
			? AtomIO.subscribeToTransaction(
					token,
					(clientUpdate) => {
						const transactionId = Math.random().toString(36).slice(2)
						const clientResult = JSON.stringify(clientUpdate)
						const topic = `tx:sync:${transactionId}`
						const sync = (serverUpdate: typeof clientUpdate) => {
							store.config.logger?.info(`Transaction ${token.key} synced`)
							socket.off(topic, sync)
							const serverResult = JSON.stringify(serverUpdate)
							if (clientResult !== serverResult) {
								store.config.logger?.error(
									`Transaction ${token.key} produced different results on client and server`,
								)
								store.config.logger?.error(`Client:`, clientResult)
								store.config.logger?.error(`Server:`, serverResult)
							} else {
								store.config.logger?.info(
									`Transaction ${token.key} results match`,
								)
							}
						}
						socket.on(topic, sync)
						socket.emit(`tx:${token.key}`, clientUpdate, transactionId)
					},
					`use-server-action`,
					store,
			  )
			: () => null
	return () => {
		const newCount = TX_SUBS.get(token.key) ?? 0
		TX_SUBS.set(token.key, newCount - 1)
		unsubscribe()
	}
}

export function useServerAction<ƒ extends AtomIO.ƒn>(
	token: AtomIO.TransactionToken<ƒ>,
): (...parameters: Parameters<ƒ>) => ReturnType<ƒ> {
	const store = React.useContext(StoreContext)
	const { socket } = React.useContext(RealtimeContext)
	React.useEffect(
		() => synchronizeTransactionResults(token, socket, store),
		[token.key],
	)
	return AtomIO.runTransaction(token, store)
}
