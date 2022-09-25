import { maybe } from "luum"

import { isPlainObject } from "~/lib/fp-tools/object"
import type { Json, JsonObj } from "~/lib/json"
import { isJson } from "~/lib/json/refine"

import type { RequireAtLeastOne } from "."
import type { Link, Links } from "./document"

export type RelationshipLinks = Links &
  RequireAtLeastOne<{
    self: Link | string
    related: Link | string
  }>

export type ResourceIdentifierObject<
  RESOURCE extends Resource = Resource,
  META extends Json | undefined = undefined
> = {
  id: RESOURCE[`id`]
  type: RESOURCE[`type`]
  meta?: META
}

export const isResourceIdentifier = (
  input: unknown
): input is ResourceIdentifierObject =>
  isPlainObject(input) &&
  typeof input[`id`] === `string` &&
  typeof input[`type`] === `string` &&
  maybe(isJson)(input.meta)

export type Identifier<
  RESOURCE extends Resource = Resource,
  META extends Json | undefined = undefined
> = ResourceIdentifierObject<RESOURCE, META>

export type Relationship<
  RESOURCE extends Resource = Resource,
  META extends Json | undefined = undefined,
  LINKS extends RelationshipLinks | undefined = undefined
> = RequireAtLeastOne<{
  links: LINKS
  data: Identifier<RESOURCE>
  meta: META
}>

export type Relationships = Record<
  string,
  {
    data: Resource | Resource[]
    links?: RelationshipLinks
    meta?: Json
  }
>

export type Linkages<RELATIONSHIPS extends Relationships> = {
  [K in keyof RELATIONSHIPS]: RELATIONSHIPS[K][`data`] extends Resource[]
    ? Relationship<
        RELATIONSHIPS[K][`data`][number],
        RELATIONSHIPS[K][`meta`],
        RELATIONSHIPS[K][`links`]
      >[]
    : RELATIONSHIPS[K][`data`] extends Resource
    ? Relationship<
        RELATIONSHIPS[K][`data`],
        RELATIONSHIPS[K][`meta`],
        RELATIONSHIPS[K][`links`]
      >
    : never
}

export type Resource = {
  id: string
  type: string
  attributes: JsonObj
  relationships: Relationships
}

export type JsonApiResource = Resource

export type ResourceObject<RESOURCE extends Resource> = {
  id: RESOURCE[`id`]
  type: RESOURCE[`type`]
  attributes: Omit<RESOURCE[`attributes`], `id` | `type`> // non-optional in this implementation
  relationships?: Linkages<RESOURCE[`relationships`]>
  links?: Links
}
export type RO<RESOURCE extends Resource> = ResourceObject<RESOURCE>
//_____________//
// Why
// is [attributes]
// optional
// in a resource object?
//¯¯¯¯¯¯¯¯¯¯¯¯¯//

export type ResourceUpdate<RESOURCE extends Resource> = {
  id: RESOURCE[`id`]
  type: RESOURCE[`type`]
  attributes?: Partial<Omit<RESOURCE[`attributes`], `id` | `type`>>
  relationships?: Partial<Linkages<RESOURCE[`relationships`]>>
}

export type RelationshipUpdate<DATA extends Resource | Resource[]> = {
  data: DATA extends Resource[]
    ? ResourceIdentifierObject<DATA[number]>[]
    : DATA extends Resource
    ? ResourceIdentifierObject<DATA>
    : never
}

export type ResourceFlat<RESOURCE extends Resource> = Omit<
  RESOURCE[`attributes`],
  `id` | `type`
> &
  Pick<RESOURCE, `id` | `type`> &
  RESOURCE[`relationships`]
