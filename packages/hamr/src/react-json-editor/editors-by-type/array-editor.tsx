import type { ReactElement } from "react"

import type { JsonArr } from "~/packages/anvl/src/json"

import { makeElementSetters } from "./utilities/array-elements"
import type { JsonEditorProps_INTERNAL } from "../json-editor-internal"
import { JsonEditor_INTERNAL } from "../json-editor-internal"

export const ArrayEditor = <_ extends JsonArr>({
	path = [],
	isReadonly = () => false,
	isHidden = () => false,
	data,
	set,
	Components,
}: JsonEditorProps_INTERNAL<JsonArr>): ReactElement => {
	const elementSetters = makeElementSetters(data, set)
	return (
		<>
			{data.map((element, index) => {
				const newPath = [...path, index]
				const set = elementSetters[index]
				if (set === undefined) {
					throw new Error(`setElement is undefined`)
				}
				return (
					<JsonEditor_INTERNAL
						key={newPath.join(``)}
						path={newPath}
						isReadonly={isReadonly}
						isHidden={isHidden}
						data={element}
						set={set}
						Components={Components}
					/>
				)
			})}
		</>
	)
}
