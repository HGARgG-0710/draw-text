// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import { substitute } from "../state/vars.mjs"
import params from "../state/params.mjs"
import svg from "../../lib/svg.mjs"
import { replaceBackground, colour } from "../../lib/lib.mjs"
import { arcData } from "./lib.mjs"

const commandpair = ([command, params]) => {
	command, params
}

const tag = (tagName, attrs, children) => ({ tag: tagName, attrs, children })

// ! THIS DOESN'T SUPPORT THE POINT-DRAWING! After having tested for Canvas - do it here too...;
// ! THIS DOESN'T SUPPORT 'line-cap'! (strokes-linecap)
// ! COMPLETE!!! [this is supposed to also work with the 'params']
// ! Add defaults for colours and other things...;
const ASTmap = {
	contour: function (points, arrows, elliptics) {
		const subShapes = []
		for (let i = 0; i < points.length; ++i) {
			while (arrows[i][0]) {
				subShapes.push(
					tag("polyline", {
						points: currpair(i),
						fill: "none",
						stroke: arrows[i][1]
					})
				)
				++i
			}
			while (elliptics[i][0]) {
				subShapes.push(
					tag("path", {
						d: [
							[
								"M",
								{
									point: xy(points[i])
								}
							],
							["A", arcData(elliptics, i)]
						].map(commandpair),
						fill: "none",
						stroke: elliptics[i][2]
					})
				)
				++i
			}
		}
		return subShapes
	},
	fill: function (points, _arrows, elliptics) {
		return {
			tag: "path",
			attrs: {
				d: points.map((p, i) =>
					commandpair(
						elliptics[i]
							? ["A", arcData(elliptics, i)]
							: ["L", { point: xy(p) }]
					)
				),
				fill: colour(points, elliptics, params)
			}
		}
	},
	// ? refactor further? [exactly same];
	clear: function (points, arrows, elliptics, background) {
		return svgAST(replaceBackground("contour")(background)(points, arrows, elliptics))
	},
	erase: function (points, arrows, elliptics, background) {
		return svgAST(replaceBackground("fill")(background)(points, arrows, elliptics))
	}
}

export function svgAST(expression) {
	const { command, argline } = substitute(expression)
	const { points, connections } = argline
	const { arrows, elliptics } = connections
	const background = params.get("background")[0]
	return ASTmap[command](points, arrows, elliptics, background)
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

export const svgTag = (text, canvas) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`
