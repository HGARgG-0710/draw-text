// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import { canvas } from "../canvas/draw.mjs"
import { substitute } from "../state/vars.mjs"
import { getParam } from "../state/params.mjs"
import svg from "../../lib/svg.mjs"
import { replaceBackground, colour, currpair } from "../../lib/lib.mjs"
import { arcData, xy } from "./lib.mjs"
import { rectData } from "../../lib/math.mjs"
import { svgColour } from "../../lib/colors.mjs"

const commandpair = ([command, params]) => ({
	command,
	params
})

const tag = (tagName, attrs, children) => ({ tag: tagName, attrs, children })

function svgPoint(x, y, colour) {
	if (getParam("draw-points")) {
		const size = getParam("point-size")
		return tag(
			...(getParam("point-shape") === "rect"
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

const isPresent = (x) => x && x[0]

const ASTmap = {
	contour: function (points, arrows, elliptics) {
		const subShapes = []
		const baseColour = getParam("base-color")
		for (let i = 0; i < points.length; ++i) {
			while (isPresent(arrows[i])) {
				subShapes.push(
					tag("polyline", {
						points: currpair(points, i).map(xy),
						fill: "none",
						stroke: arrows[i][1] || baseColour
					})
				)
				svgPoint(...points[i++])
			}
			while (isPresent(elliptics[i])) {
				subShapes.push(
					tag("path", {
						d: [
							[
								"M",
								{
									point: xy(points[i])
								}
							],
							["A", arcData(points, elliptics, i)]
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
	fill: function (points, arrows, elliptics) {
		return {
			tag: "path",
			attrs: {
				d: (points.length
					? [commandpair(["M", { point: xy(points[0]) }])]
					: []
				).concat(
					points
						.map((_p, i) =>
							(elliptics[i][0]
								? [["A", arcData(points, elliptics, i)]]
								: !isPresent(elliptics[i - 1]) || arrows[i][0]
								? [["L", { point: xy(points[(i + 1) % points.length]) }]]
								: []
							).map((x) => (x.length ? commandpair(x) : x))
						)
						.flat()
				),
				fill: colour(points, elliptics)
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
	if (!(command in ASTmap)) return []
	// TODO: create a separate class for special signatures (the direct '...argline')
	if (command === "background") return ASTmap[command](...argline)
	const { points, connections } = argline
	const { arrows, elliptics } = connections
	const background = getParam("background")
	return ASTmap[command](points, arrows, elliptics, background)
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

export const svgTag = (text) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`
