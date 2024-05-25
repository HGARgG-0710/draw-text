import { arcNextPoint } from "../../lib/svg-values.mjs"
import { canvas } from "../canvas/draw.mjs"
import { substitute } from "../state/vars.mjs"
import { svgParams } from "../state/params.mjs"
import svg from "../../lib/svg.mjs"
import { replaceColourBackground, colour } from "../../lib/lib.mjs"
import { arcData, xy } from "./lib.mjs"
import { rectData } from "../../lib/math.mjs"
import { svgColour } from "../../lib/colors.mjs"

const commandpair = ([command, params]) => ({
	command,
	params
})

export const tag = (tagName, attrs, children) => ({ tag: tagName, attrs, children })

function svgPoint(x, y, colour) {
	if (svgParams.get("draw-points")) {
		const size = svgParams.get("point-size")
		return tag(
			...(svgParams.get("point-shape") === "rect"
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

const frequentParams = () => ({
	"stroke-linejoin": ((x) => (x === "r" ? "round" : x === "b" ? "bevel" : "mitter"))(
		svgParams.get("line-join")
	),
	"stroke-linecap": ((x) => (x === "r" ? "round" : x === "b" ? "butt" : "square"))(
		svgParams.get("line-cap")
	),
	"stroke-miterlimit": svgParams.get("miter-limit"),
	"stroke-width": svgParams.get("line-width")
})

const colourReplacement = (name) =>
	function (argline) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections
		return svgAST(
			replaceColourBackground(name)(svgParams.get("background"))(
				points,
				arrows,
				elliptics
			)
		)
	}

const ASTmap = {
	contour: function (argline) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections
		const baseColour = svgParams.get("base-color")
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
							stroke,
							...frequentParams()
						}),
					svgPoint(...points[i])
				])
			}, [])
			.filter((x) => x)
	},
	fill: function (argline) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections
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
				fill: colour(svgParams)(points, elliptics),
				...frequentParams()
			}
		}
	},
	clear: colourReplacement("contour"),
	erase: colourReplacement("fill"),
	"stroke-text": function (argline) {
		const [text, font, point] = argline
		return tag(
			"text",
			{
				style: `font: ${font}`,
				stroke: point[2],
				fill: "none",
				"paint-order": "stroke",
				x: point[0] || 0,
				y: point[1] || 0,
				...frequentParams()
			},
			[text]
		)
	},
	"fill-text": function (argline) {
		const [text, font, point] = argline
		return tag(
			"text",
			{
				style: `font: ${font}`,
				stroke: "none",
				fill: point[2],
				x: point[0] || 0,
				y: point[1] || 0,
				...frequentParams()
			},
			[text]
		)
	},
	"font-load": function (argline) {
		const [fontName, fontUrl] = argline
		return tag("style", {}, [
			`@font-face {\n\tfont-family: "${fontName}";\n\tsrc: url("${fontUrl}");\n}`
		])
	}
}

export function svgAST(expression) {
	const { command, argline } = substitute(expression)
	return command in ASTmap ? ASTmap[command](argline) : []
}

export function tosvg(expression) {
	return svg(svgAST(expression))
}

export const svgTag = (text) =>
	`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}">\n${text}\n</svg>`
