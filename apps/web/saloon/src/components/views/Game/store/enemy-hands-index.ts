import * as AtomIO from "atom.io"
import { myIdState } from "atom.io/realtime-client"

import { playersInRooms } from "~/apps/node/lodge/src/store/rooms"

import { myRoomState } from "./my-room"

export const otherPlayersIndex = AtomIO.selector<string[]>({
	key: `otherPlayersIndex`,
	get: ({ get }) => {
		const myId = get(myIdState)
		if (!myId) {
			return []
		}
		const myRoomId = get(myRoomState)
		if (myRoomId === null) {
			return []
		}
		const playerIdsInMyRoom = get(playersInRooms.findRelatedKeysState(myRoomId))
		const everyoneButMe = playerIdsInMyRoom.filter((id) => id !== myId)
		return everyoneButMe
	},
})
