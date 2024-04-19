// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

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

const ASTmap = {
	contour: function (points, arrows, elliptics) {
		const subShapes = []
		const baseColour = getParam("base-color")
		// ! REFACTOR;
		const isPresent = (x) => x && x[0]
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
	fill: function (points, _arrows, elliptics) {
		return {
			tag: "path",
			attrs: {
				d: points
					.map((p, i) =>
						(elliptics[i][0]
							? [[!i ? "M" : "A", arcData(points, elliptics, i)]]
							: [[!i ? "M" : "L", { point: xy(p) }]]
						).map(commandpair)
					)
					.flat(),
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
	if (!(argline instanceof Array)) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections
		const background = getParam("background")
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
