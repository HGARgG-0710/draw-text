// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import params from "./params.mjs"
import process from "./process.mjs"

// TODO: later, make this into a full-blown SVG-AST API, then publish as an NPM package...; [also, write a parser and a way to construct SVG from the AST]; [And the 'formatter' - done by means of parsing, then using the obtained AST to get the 'normalized' SVG];
// * Many of the features of SVG are excessive, and are thus not present in Draw-Text (as it's intended to be as minimalistic and compact as possible...);
export function svg(tagNode) {
	const { tag, attrs } = tagNode
	switch (tag) {
		case "polyline":
			break
		case "path":
			break
	}
}

// ! THIS DOESN'T SUPPORT THE POINTS-DRAWING! After having tested - do it...;
export function svgAST(expression) {
	const { command, argline } = expression
	const { points, connections } = argline
	const { arrows, elliptics } = connections
	const background = params.get("background")[0]
	// ? re-do as a function-map? DEFINITELY!
	switch (command) {
		case "contour":
			const subShapes = []
			for (let i = 0; i < points.length; ++i) {
				while (arrows[i][0]) {
					subShapes.push({
						tag: "polyline",
						attrs: {
							points: [0, 1].map((k) => points[(i + k) % points.length]),
							fill: "none",
							stroke: arrows[i][1]
						}
					})
					++i
				}
				while (elliptics[i][0]) {
					subShapes.push({
						tag: "path",
						attrs: {
							d: [
								{
									command: "A",
									params: {
										// ! ADD... [x,y]...
										radius: [],
										// ! rotationAngle
										angle: 0,
										// ! THESE TWO ARE SUPPOSED TO BE THE SUBSTITUTES FOR 'isCenterAbove/isCenterBelow/isCenterLeft/isCenterRight' + 'isAbove/isBelow'!!!
										largeArc: false,
										sweep: false,
										// ! the 'x y' of the 'A' command...
										nextPoint: []
									}
								}
							]
						}
					})
				}
				++i
			}
			break
		case "fill":
			// ! Define analogously... BUT - has to have 'fill' in proper places... (think about it some...);
			break
		case "clear":
			break
		case "erase":
	}
	// ! THE MAIN PART OF THE 'SVG' API! Transforms an elementary expression in DTPL to SVG (they're very similar, so shouldn't be too complex...);
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

// * Finding that the thing is analogous to 'process';
export function svgProcess(expression) {
	const { command } = expression
	if (["set-param", "variable"].includes(command) || params.has(command)) {
		process(expression)
		return ""
	}
	return tosvg(expression)
}

const svgTag = (text, canvas) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`

export function svgURI(parsed) {
	// ! THIS IS NOT THE STRING! Fix it. Must also include all the svg-version-specific stuff, such as the <svg> tag...;
	return encodeURI(
		`data:image/svg+xml;base64,${encodeURIComponent(
			new DOMParser().parseFromString(
				svgTag(parsed.map(svgProcess).join("\n")),
				"image/svg+xml"
			).documentURI
		)}`
	)
}
