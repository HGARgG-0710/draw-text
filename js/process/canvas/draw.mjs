import { colour, currpair, drawReplaceBackground } from "../../lib/lib.mjs"
import { ellipseData, rectData } from "../../lib/math.mjs"
import { setParam, getParam } from "../state/params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ! added the point-drawing parameter definition; All that is left is to test them out...;
const drawMap = {
	contour: function (points, arrows, elliptics) {
		for (const key of Array.from(points.keys())) {
			context.fillStyle = points[key][2] || getParam("base-color")
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
		// ! DEBUG CODE!
		let center
		context.fillStyle = colour(points, elliptics)
		context.beginPath()
		for (const key of Array.from(points.keys())) {
			if (elliptics[key][0]) {
				center = ellipse(points, elliptics, key)
				continue
			}
			line(points, key)
		}
		context.closePath()
		context.fill()

		// ! DEBUG CODE! DELETE LATER!
		console.log("ET???")
		setParam("draw-points", true, context)
		setParam("point-size", 4, context)
		const prevStyle = context.fillStyle
		context.fillStyle = "red"
		currpair(points, 0).forEach((p) => drawPoint(...p))
		drawPoint(...center)
		context.fillStyle = prevStyle
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
	const { center, radius, rotationAngle, startAngle, endAngle } = ellipseData(
		currpair(points, key),
		elliptics[key][1],
		...elliptics[key].slice(3, 5)
	)
	context.ellipse(...center, ...radius, rotationAngle, startAngle, endAngle)
	// ! DEBUG CODE !
	return center
}

export function drawPoint(x, y) {
	if (getParam("draw-points")) {
		const [size, shape] = ["point-size", "point-shape"].map((param) =>
			getParam(param)
		)
		switch (shape) {
			case "circ":
				const path = new Path2D()
				path.arc(x, y, size)
				context.fill(path)
				break
			case "rect":
				const { x: xleft, y: ytop, width, height } = rectData(x, y, size)
				context.fillRect(xleft, ytop, width, height)
		}
	}
}

export default function draw(primitive) {
	const background = getParam("background")
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
