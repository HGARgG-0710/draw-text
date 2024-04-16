// ? Rename this module into 'drawcanvas'? That is due to the fact that it (essentially), implements the canvas interface. The website, then, would only use the API as a special case...;
// ! continue refactoring...;

import { ellipseData } from "../../lib/math.mjs"
import params from "../state/params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ! added the point-drawing parameter definition; All that is left is to test them out...;
// ! PROBLEM - no way to add round angles to 'fill' contours currently (or so it seems) - test, then do something about it...;
const drawMap = {
	contour: function (points, arrows, elliptics) {
		for (const key of Array.from(points.keys())) {
			context.fillStyle = points[key][2] || params.get("base-color")[0]
			drawPoint(...points[key])

			context.beginPath()
			// * For contour...
			context.strokeStyle = arrows[key][1] || elliptics[key][2] || context.fillStyle
			if (arrows[key][0]) {
				context.moveTo(...points[key])
				line(points, key)
			} else if (elliptics[key][0]) ellipse(points, elliptics, key)
			// * For point...
			context.stroke()
		}
	},
	fill: function (points, _arrows, elliptics) {
		context.fillStyle =
			points
				.map((x, i) => (x[2] ? x[2] : elliptics[i][2]))
				.reduce((acc, curr) => (acc ? acc : curr ? curr : null), null) ||
			params.get("base-color")[0]
		context.beginPath()
		for (const key of Array.from(points.keys())) {
			if (elliptics[key][0]) {
				ellipse(points, elliptics, key)
				continue
			}
			line(points, key)
		}
		context.closePath()
		context.fill()
	},
	// ! refactor these two;
	clear: (points, arrows, elliptics, background) =>
		draw({
			command: "contour",
			argline: {
				points: points.map((x) => {
					x[2] = background
					return x
				}),
				connections: {
					arrows: arrows.map((arrow) => {
						arrow[1] = background
						return arrow
					}),
					elliptics: elliptics.map((elliptic) => {
						elliptic[3] = background
						return elliptic
					})
				}
			}
		}),
	erase: (points, arrows, elliptics, background) =>
		draw({
			command: "fill",
			argline: {
				points: points.map((x) => {
					x[2] = background
					return x
				}),
				connections: {
					arrows: arrows.map((x) => {
						x[1] = background
						return x
					}),
					elliptics: elliptics.map((x) => {
						x[3] = background
						return x
					})
				}
			}
		})
}

context.imageSmoothingEnabled = false

function line(points, key) {
	context.lineTo(...points[(key + 1) % points.length])
}

// ^ idea: Add the appropriate 'casual' geometric functions/identities to future releases of 'math-expressions.js' (things like Pythagoreas, work with angles, trignonometry - this and other stuff...):
function ellipse(points, elliptics, key) {
	// ! alias the '[0, 1]' properly...;
	const pair = [0, 1].map((i) => points[(key + i) % points.length])

	const { center, radius, rotationAngle, startAngle, endAngle } = ellipseData(
		pair,
		elliptics[key][1],
		...elliptics[key].slice(3, 5)
	)

	context.ellipse(...center, ...radius, rotationAngle, startAngle, endAngle)
}

function drawPoint(x, y) {
	if (params.get("draw-points")[0]) {
		const path = new Path2D()
		const size = params.get("point-size")[0]
		switch (params.get("point-shape")[0]) {
			case "circ":
				path.arc(x, y, size)
				break
			case "rect":
				const [delta, side] = [(x, y) => x / y, (x, y) => x * y].map((f) =>
					f(size, Math.sqrt(2))
				)
				context.fillRect(...[x, y].map((t) => t - delta), Array(2).fill(side))
		}
		context.fill(path)
	}
}

export default function draw(primitive) {
	const background = params.get("background")[0]
	if (primitive) {
		const { command } = primitive

		const { argline } = primitive
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}

		if (points.length) drawMap[command](points, arrows, elliptics, background)
	}
}
export function clear() {
	context.reset()
}
