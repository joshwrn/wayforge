import type { SerializedStyles } from "@emotion/react"
import type { FC } from "react"

import { ElasticInput } from "."

export type TextInputProps = {
	value: string
	set?: ((value: string) => void) | undefined
	label?: string
	placeholder?: string
	customCss?: SerializedStyles
	autoSize?: boolean
	readOnly?: boolean
}

export const TextInput: FC<TextInputProps> = ({
	value,
	set,
	label,
	placeholder,
	customCss,
	autoSize = false,
}) => {
	return (
		<span css={customCss}>
			<label>{label}</label>
			{autoSize ? (
				<ElasticInput
					type="text"
					value={value}
					onChange={(e) => set?.(e.target.value)}
					disabled={set === undefined}
					placeholder={placeholder}
				/>
			) : (
				<input
					type="text"
					value={value}
					onChange={(e) => set?.(e.target.value)}
					disabled={set === undefined}
					placeholder={placeholder}
				/>
			)}
		</span>
	)
}
