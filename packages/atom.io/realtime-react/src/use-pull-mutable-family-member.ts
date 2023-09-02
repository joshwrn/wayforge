import * as AtomIO from "atom.io"
import type { Json } from "atom.io/json"
import type { MutableAtomFamily } from "atom.io/mutable"
import { getJsonToken, getTrackerToken } from "atom.io/mutable"
import { StoreContext } from "atom.io/react"
import type { Transceiver } from "atom.io/tracker"
import * as React from "react"

import { RealtimeContext } from "./realtime-context"

export function usePullMutableFamilyMember<
	T extends Transceiver<Json.Serializable>,
	J extends Json.Serializable,
>(
	family: MutableAtomFamily<T, J, Json.Serializable>,
	subKey: AtomIO.Json.Serializable,
): void {
	const token = family(subKey)
	const { socket } = React.useContext(RealtimeContext)
	const store = React.useContext(StoreContext)
	React.useEffect(() => {
		socket?.on(`init:${token.key}`, (data: J) => {
			const token = family(subKey)
			const jsonToken = getJsonToken(token)
			AtomIO.setState(jsonToken, data, store)
		})
		socket?.on(
			`next:${token.key}`,
			(data: T extends Transceiver<infer Signal> ? Signal : never) => {
				const token = family(subKey)
				const trackerToken = getTrackerToken(token)
				AtomIO.setState(trackerToken, data, store)
			},
		)
		socket?.emit(`sub:${family.key}`, subKey)
		return () => {
			socket?.off(`serve:${token.key}`)
			socket?.emit(`unsub:${token.key}`)
		}
	}, [family.key])
}
