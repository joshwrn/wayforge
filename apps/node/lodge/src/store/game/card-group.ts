import { atom, atomFamily } from "atom.io"
import { selectJson } from "atom.io/json"
import { TransceiverSet } from "~/packages/anvl/reactivity"

import { Join } from "~/packages/anvl/src/join"
import { createMutableAtom } from "~/packages/atom.io/mutable/src"
import { AtomicJunction } from "../utils/atomic-junction"

export type CardGroup = {
	type: `deck` | `hand` | `pile` | null
	name: string
	rotation: number
}
export const findCardGroupState = atomFamily<CardGroup, string>({
	key: `findCardGroup`,
	default: () => ({
		type: null,
		name: ``,
		rotation: 0,
	}),
})
export const cardGroupIndex = createMutableAtom<
	TransceiverSet<string>,
	string[]
>({
	key: `cardGroupsIndex::mutable`,
	default: new TransceiverSet<string>(),
	toJson: (set) => [...set],
	fromJson: (array) => new TransceiverSet<string>(array),
})

export const groupsOfCards = new AtomicJunction({
	key: `groupsOfCards`,
	between: [`groupId`, `cardId`],
	cardinality: `1:n`,
})

export const ownersOfGroups = new AtomicJunction({
	key: `ownersOfGroups`,
	between: [`playerId`, `groupId`],
	cardinality: `1:n`,
})
