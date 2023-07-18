import { wrapInto } from "~/packages/anvl/src/number"
import type { Filter, Degree } from "~/packages/luum/src"

export default (hue: Degree, filter: Filter): number => {
	// 430
	let maxSat = 255
	const hueWrapped = wrapInto(0, 360)(hue) // 70
	for (let a = -1, b = 0; b < filter.length; a++, b++) {
		a = wrapInto(0, filter.length)(a)
		const hueDoubleWrapped = a > b ? wrapInto(-180, 180)(hueWrapped) : undefined // undef
		// rome-ignore lint/style/noNonNullAssertion: safe in this context
		const tuningPointA = filter[a]!
		// rome-ignore lint/style/noNonNullAssertion: safe in this context
		const tuningPointB = filter[b]!
		const hueA = a > b ? wrapInto(-180, 180)(tuningPointA.hue) : tuningPointA.hue
		const hueB = tuningPointB.hue
		if (
			(hueDoubleWrapped || hueWrapped) >= hueA &&
			(hueDoubleWrapped || hueWrapped) < hueB
		) {
			let $ = hueDoubleWrapped || hueWrapped // 70
			$ -= hueA // 70 - 50 = 20 //
			$ /= hueB - hueA // 20 / (120 - 50) = 2/7
			$ *= tuningPointB.sat - tuningPointA.sat // -128 * 2 / 7 = -256 / 7 ~= -37
			$ += tuningPointA.sat
			Math.round($)
			// console.log('||| _', _)
			maxSat = $
		}
	}
	return maxSat
}
