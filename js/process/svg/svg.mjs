// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import { ellipseData } from "../../lib/math.mjs"
import params from "../state/params.mjs"
import svg from "../../lib/svg.mjs"

const commandpair = ([command, params]) => {
	command, params
}

// ! THIS DOESN'T SUPPORT THE POINTS-DRAWING! After having tested for Canvas - do it here too...;
export function svgAST(expression) {
	const { command, argline } = expression
	const { points, connections } = argline
	const { arrows, elliptics } = connections
	const background = params.get("background")[0]

	// TODO: refactor later...;
	const currpair = (i) => [0, 1].map((k) => points[(i + k) % points.length])

	// ? re-do as a function-map? DEFINITELY!
	switch (command) {
		case "contour":
			const subShapes = []
			for (let i = 0; i < points.length; ++i) {
				while (arrows[i][0]) {
					subShapes.push({
						tag: "polyline",
						attrs: {
							points: currpair(i),
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
								[
									"M",
									{
										point: points[i]
									}
								],
								[
									"A",
									{
										...(() =>
											({
												radius,
												rotationAngle: angle,
												nextPoint
											} = ellipseData(
												currpair(i),
												elliptics[i][1],
												...elliptics[i].slice(3, 5)
											)))(),
										// ! THESE TWO ARE SUPPOSED TO BE THE SUBSTITUTES FOR 'isCenterAbove/isCenterBelow/isCenterLeft/isCenterRight' + 'isAbove/isBelow'!!!
										largeArc: true,
										sweep: false
									}
								]
							].map(commandpair)
						}
					})
					++i
				}
			}
			return subShapes
		case "fill":
			// ! Define the path accordingly to the given expression...;
			return {
				tag: "path",
				attrs: {
					d: []
				}
			}
		case "clear":
			break
		case "erase":
	}
	// ! THE MAIN PART OF THE 'SVG' API! Transforms an elementary expression in DTPL to SVG (they're very similar, so shouldn't be too complex...);
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

export const svgTag = (text, canvas) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`
