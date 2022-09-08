import type { FC } from "react"

import type { JsonTypes } from "~/lib/json"

import { ArrayEditor } from "./editors-by-type/array-editor"
import { ObjectEditor } from "./editors-by-type/object-editor"
import {
  BooleanEditor,
  NullEditor,
  NumberEditor,
  StringEditor,
} from "./editors-by-type/primitive-editors"
import type { JsonEditorProps_INTERNAL } from "./json-editor-internal"

export type JsxElements = ReturnType<FC>

export * from "./default-components"
export * from "./recoil-interface"
export * from "./developer-interface"

export const SubEditors: Record<
  keyof JsonTypes,
  FC<JsonEditorProps_INTERNAL<any>>
> = {
  array: ArrayEditor,
  boolean: BooleanEditor,
  null: NullEditor,
  number: NumberEditor,
  object: ObjectEditor,
  string: StringEditor,
}
