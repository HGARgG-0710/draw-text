import { svgTag } from "./svg.mjs"
import { svgProcess } from "./process.mjs"
import { canvas } from "../canvas/draw.mjs"

export function svgURI(parsed) {
	// ! a temp variable...; 
	const svgCode = svgTag(parsed.map(svgProcess).join("\n"), canvas)	
	console.log(svgCode)
	return URL.createObjectURL(
		new Blob([svgCode])
	)
}
