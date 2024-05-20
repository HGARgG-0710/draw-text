// ! PROBLEM: does not yet support multiple files...; fix.fix.fix.

import { arcNextPoint } from "../../lib/svg-values.mjs"
import { canvas } from "../canvas/draw.mjs"
import { substitute } from "../state/vars.mjs"
import { getParam } from "../state/params.mjs"
import svg from "../../lib/svg.mjs"
import { replaceBackground, colour } from "../../lib/lib.mjs"
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
	// ? Refactor? ['contour' and 'fill' look VEEE-E-E-ERY similar...];
	contour: function (points, arrows, elliptics) {
		const baseColour = getParam("base-color")
		const svgPoints = points.map((point, i) =>
			elliptics[i][0]
				? arcData(points, elliptics, i).startPoint
				: isPresent(elliptics[i - 1])
				? arcData(points, elliptics, i).nextPoint
				: point
		)
		return svgPoints
			.reduce((prev, curr, i) => {
				const elPres = isPresent(elliptics[i])
				const stroke = (elPres ? elliptics[i][2] : arrows[i][1]) || baseColour
				const ad = arcData(points, elliptics, i)
				return prev.concat([
					(elPres || arrows[i][0]) &&
						tag("path", {
							d: [commandpair(["M", { point: xy(curr) }])].concat([
								commandpair(
									elPres
										? [
												"A",
												((x) => ({
													...x,
													nextPoint: x.nextPoint.map(
														arcNextPoint(1)
													)
												}))(ad)
										  ]
										: [
												"L",
												{
													point: xy(
														points[(i + 1) % points.length]
													)
												}
										  ]
								)
							]),
							transform: elPres
								? [["rotation", [ad.rotationAngle, ...ad.center]]]
								: [],
							fill: "none",
							stroke
						}),
					svgPoint(...points[i])
				])
			}, [])
			.filter((x) => x)
	},
	fill: function (points, arrows, elliptics) {
		const svgPoints = points.map((point, i) =>
			elliptics[i][0]
				? arcData(points, elliptics, i).rotatedStart
				: isPresent(elliptics[i - 1])
				? arcData(points, elliptics, i - 1).rotatedEnd
				: point
		)
		return {
			tag: "path",
			attrs: {
				d: svgPoints.reduce(
					(prev, curr, i) =>
						prev.concat([
							commandpair(
								elliptics[i][0]
									? [
											"A",
											{
												...arcData(points, elliptics, i),
												nextPoint: svgPoints[
													(i + 1) % svgPoints.length
												].map(arcNextPoint(0))
											}
									  ]
									: [
											"L",
											{
												point: xy(
													svgPoints[(i + 1) % points.length]
												)
											}
									  ]
							)
						]),
					svgPoints.length
						? [commandpair(["M", { point: xy(svgPoints[0]) }])]
						: []
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
	background: function (fill) {
		const { width, height } = canvas
		return tag("rect", {
			x: 0,
			y: 0,
			width,
			height,
			fill
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
