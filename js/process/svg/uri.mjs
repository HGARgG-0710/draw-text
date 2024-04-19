import { svgTag } from "./svg.mjs"
import { svgProcess } from "./process.mjs"
import { canvas } from "../canvas/draw.mjs"

export function svgURI(parsed) {
	return URL.createObjectURL(
		new Blob([svgTag(parsed.map(svgProcess).join("\n"), canvas)])
	)
}
