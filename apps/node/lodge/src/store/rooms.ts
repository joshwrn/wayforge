import type { TransactionIO } from "atom.io"
import { atom, atomFamily, selector, transaction } from "atom.io"
import { nanoid } from "nanoid"

import { AtomicJunction } from "./utils/atomic-junction"

export const roomsIndex = atom<Set<string>>({
	key: `roomsIndex`,
	default: new Set<string>(),
})
export const roomsIndexJSON = selector<string[]>({
	key: `roomsIndexJSON`,
	get: ({ get }) => [...get(roomsIndex)],
	set: ({ set }, newValue) => set(roomsIndex, new Set(newValue)),
})
export type Room = {
	id: string
	name: string
}
export const findRoomState = atomFamily<Room, string>({
	key: `findRoom`,
	default: { id: ``, name: `` },
})

export type Player = {
	id: string
	name: string
}
export const findPlayerState = atomFamily<Player, string>({
	key: `findPlayer`,
	default: {
		id: ``,
		name: ``,
	},
})
export const playersIndex = atom<Set<string>>({
	key: `playersIndex`,
	default: new Set<string>(),
})
export const playersIndexJSON = selector<string[]>({
	key: `playersIndexJSON `,
	get: ({ get }) => [...get(playersIndex)],
	set: ({ set }, newValue) => set(playersIndex, new Set(newValue)),
})

// export const PLAYERS_IN_ROOMS = new Join<{ enteredAt: number }>({
// 	relationType: `1:n`,
// })
// 	.from(`roomId`)
// 	.to(`playerId`)
// export const playersInRoomsState = atom<
// 	Join<{ enteredAt: number }, `roomId`, `playerId`>
// >({
// 	key: `playersInRoomsIndex`,
// 	default: PLAYERS_IN_ROOMS,
// })
// export const playersInRoomsStateJSON = selectJson(
// 	playersInRoomsState,
// 	PLAYERS_IN_ROOMS.makeJsonInterface(
// 		hasExactProperties({ enteredAt: isNumber }),
// 	),
// )
// export const findPlayersInRoomState = selectorFamily<
// 	{ id: string; enteredAt: number }[],
// 	string
// >({
// 	key: `findPlayersInRoom`,
// 	get: (roomId) => ({ get }) => get(playersInRoomsState).getRelations(roomId),
// 	set: (roomId) => ({ set }, newValue) =>
// 		set(playersInRoomsState, (current) =>
// 			current.setRelations({ roomId }, newValue),
// 		),
// })

export const playersInRooms = new AtomicJunction({
	key: `playersInRooms`,
	between: [`roomId`, `playerId`],
	cardinality: `1:n`,
	defaultContent: { enteredAt: 0 },
})

export const createRoomTX = transaction<(id?: string) => string>({
	key: `createRoom`,
	do: ({ set }, roomId = nanoid()) => {
		set(roomsIndex, (ids) => new Set([...ids, roomId].sort()))
		return roomId
	},
})
export type CreateRoomIO = TransactionIO<typeof createRoomTX>

export const joinRoomTX = transaction<
	(options: { roomId: string; playerId: string }) => void
>({
	key: `joinRoom`,
	do: (_, { roomId, playerId }) => {
		// set(playersInRoomsState, (current) =>
		// 	current.set({ roomId, playerId }, { enteredAt: Date.now() }),
		// )
		playersInRooms.set({ roomId, playerId }, { enteredAt: Date.now() })
	},
})
export type JoinRoomIO = TransactionIO<typeof joinRoomTX>

export const leaveRoomTX = transaction<
	(options: { roomId: string; playerId: string }) => void
>({
	key: `leaveRoom`,
	do: (_, { roomId, playerId }) => {
		// set(playersInRoomsState, (current) => current.remove({ roomId, playerId }))
		playersInRooms.delete({ roomId, playerId })
	},
})
export type LeaveRoomIO = TransactionIO<typeof leaveRoomTX>
