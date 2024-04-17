// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import { substitute } from "../state/vars.mjs"
import params from "../state/params.mjs"
import svg from "../../lib/svg.mjs"
import { replaceBackground, colour } from "../../lib/lib.mjs"
import { arcData } from "./lib.mjs"
import { rectData } from "../../lib/math.mjs"
import { svgColour } from "../../lib/colors.mjs"

const commandpair = ([command, params]) => {
	command, params
}

const tag = (tagName, attrs, children) => ({ tag: tagName, attrs, children })

function svgPoint(x, y, colour) {
	if (params.get("draw-points")[0]) {
		const size = params.get("point-size")[0]
		return tag(
			...(params.get("point-shape")[0] === "rect"
				? [
						"rect",
						{
							...rectData(...xy(point), size),
							...svgColour(colour)
						}
				  ]
				: [
						"circle",
						{
							center: [x, y],
							radius: size,
							...svgColour(colour)
						}
				  ])
		)
	}
}

// ! COMPLETE!!! [this is supposed to also work with the 'params']
// * 	Params that are not yet supported as data [FIX]:
// 		1. line-cap (strokes-linecap);
// 		2. line-width (stroke-width);
// 		3. line-join (stroke-linejoin: use only just the 'round', 'miter' and 'bevel');
// 		4. miter-limit (not done in Canvas either yet...);
// ! Add defaults for colours and other things...;
const ASTmap = {
	contour: function (points, arrows, elliptics) {
		const subShapes = []
		const baseColour = params.get("base-color")[0]
		for (let i = 0; i < points.length; ++i) {
			while (arrows[i][0]) {
				subShapes.push(
					tag("polyline", {
						points: currpair(i).map(xy),
						fill: "none",
						stroke: arrows[i][1] || baseColour
					})
				)
				svgPoint(...points[i++])
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
						stroke: elliptics[i][2] || baseColour
					})
				)
				svgPoint(...points[i++])
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
	},
	background: function (colour) {
		return tag("rect", {
			x: 0,
			y: 0,
			width: canvas.width,
			height: canvas.height,
			fill: colour
		})
	}
}

export function svgAST(expression) {
	const { command, argline } = substitute(expression)
	if (!(argline instanceof Array)) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections
		const background = params.get("background")[0]
		return command in ASTmap
			? ASTmap[command](points, arrows, elliptics, background)
			: []
	}
	return ASTmap[command](...argline)
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

export const svgTag = (text, canvas) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`
