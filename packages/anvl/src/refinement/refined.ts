import type { Refinement } from "../refinement"

type KeysOfValue<T, V extends T[keyof T]> = {
	[K in keyof T]-?: V extends T[K] ? K : never
}[keyof T]
type KeysNotOfValue<T, V extends T[keyof T]> = {
	[K in keyof T]-?: V extends T[K] ? never : K
}[keyof T]

type PickByValue<T, V extends T[keyof T]> = Pick<T, KeysOfValue<T, V>>
type OmitByValue<T, V extends T[keyof T]> = Pick<T, KeysNotOfValue<T, V>>

export type Refined<
	Structure extends Record<string, Refinement<unknown, any>>,
	RefinementTargets = {
		[K in keyof Structure]: Structure[K] extends Refinement<unknown, infer U>
			? U
			: never
	},
	// @ts-expect-error awkward
	Properties = OmitByValue<RefinementTargets, undefined>,
	// @ts-expect-error awkward
	PossiblyUndefinedProperties = PickByValue<RefinementTargets, undefined>,
	RequiredProperties = { [PK in keyof Properties]-?: Properties[PK] },
	OptionalProperties = {
		[OPK in
			keyof PossiblyUndefinedProperties]+?: PossiblyUndefinedProperties[OPK]
	},
	/* eslint-disable-next-line @typescript-eslint/sort-type-constituents */
> = RequiredProperties & OptionalProperties
