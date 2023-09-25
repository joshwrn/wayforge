import type { Refinement } from "~/packages/rel8/types/src"
import type { Json } from "../json"

export type Identified = { id: string }
export type Branded<TypeName extends string> = { type: TypeName }
export type Docket<TypeName extends string> = Branded<TypeName> & Identified
export type Parcel<
	TypeName extends string,
	Contents extends Json.Serializable | { toJSON: () => Json.Serializable },
> = Docket<TypeName> & { contents: Contents }
export type ContentsOf<SomeParcel extends Parcel<any, any>> =
	SomeParcel extends Parcel<any, infer Contents> ? Contents : never

export const hasId: Refinement<unknown, Identified> = (
	input,
): input is Identified =>
	typeof input === `object` &&
	input !== null &&
	typeof (input as Identified).id === `string`

export const identify = (input: unknown): { id: string } => {
	if (hasId(input)) return input
	throw new Error(`${input} could not be identified`)
}
