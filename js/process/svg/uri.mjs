import { svgTag } from "./svg.mjs"
import { svgProcess } from "./process.mjs"

export function svgURI(parsed) {
	return encodeURI(
		`data:image/svg+xml;base64,${encodeURIComponent(
			new DOMParser().parseFromString(
				svgTag(parsed.map(svgProcess).join("\n")),
				"image/svg+xml"
			).documentURI
		)}`
	)
}
