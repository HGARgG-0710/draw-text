import { colour, currpair, drawReplaceBackground } from "../../lib/lib.mjs"
import { ellipseData, rectData, toRadians } from "../../lib/math.mjs"
import { getParam } from "../state/params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ^ IDEA: create a new parameter - 'point-cover' with values 'true/false' (default: false); If set to true, then the points shall be drawn before the connections;
const drawMap = {
	contour: function (points, arrows, elliptics) {
		const baseColour = getParam("base-color")
		let fillStyle = null
		let strokeStyle = null
		// * drawing the connections
		for (const key of Array.from(points.keys())) {
			context.beginPath()
			strokeStyle = context.strokeStyle =
				arrows[key][1] || elliptics[key][2] || strokeStyle || baseColour
			if (arrows[key][0]) {
				context.moveTo(...points[key])
				line(points, key)
			} else if (elliptics[key][0]) ellipse(points, elliptics, key)

			context.stroke()
		}
		// * drawing the points;
		for (const key of Array.from(points.keys())) {
			fillStyle = context.fillStyle = points[key][2] || fillStyle || baseColour
			drawPoint(...points[key])
		}
	},
	fill: function (points, _arrows, elliptics) {
		context.fillStyle = colour(points, elliptics)
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
	const { center, radius, rotationAngle, startAngle, endAngle } = ellipseData(
		currpair(points, key),
		elliptics[key][1],
		...elliptics[key].slice(3, 5)
	)
	context.ellipse(...center, ...radius, rotationAngle, startAngle, endAngle)
}

export function drawPoint(x, y) {
	if (getParam("draw-points")) {
		const [size, shape] = ["point-size", "point-shape"].map((param) =>
			getParam(param)
		)
		switch (shape) {
			case "circ":
				const path = new Path2D()
				path.arc(x, y, size, toRadians(0), toRadians(360))
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
