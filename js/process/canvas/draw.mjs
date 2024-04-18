import { colour, drawReplaceBackground } from "../../lib/lib.mjs"
import { ellipseData, rectData } from "../../lib/math.mjs"
import params from "../state/params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ! added the point-drawing parameter definition; All that is left is to test them out...;
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
		context.fillStyle = colour(points, elliptics, params)
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
	clear: (points, arrows, elliptics, background) =>
		drawReplaceBackground("contour")(background)(points, arrows, elliptics),
	erase: (points, arrows, elliptics, background) =>
		drawReplaceBackground("fill")(background)(points, arrows, elliptics)
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
		const size = params.get("point-size")[0]
		switch (params.get("point-shape")[0]) {
			case "circ":
				const path = new Path2D()
				path.arc(x, y, size)
				context.fill(path)
				break
			case "rect":
				const { x: xleft, y: ytop, width, height } = rectData(size)
				context.fillRect(xleft, ytop, width, height)
		}
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
