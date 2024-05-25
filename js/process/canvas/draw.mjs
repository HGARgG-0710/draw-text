import { fontFiles, files } from "../../activation.mjs"
import { colour, currpair, drawReplaceBackground } from "../../lib/lib.mjs"
import { ellipseData, rectData, toRadians } from "../../lib/math.mjs"
import { loadFont } from "../state/fonts.mjs"
import { canvasParams } from "../state/params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ^ IDEA: create a new parameter - 'point-cover' with values 'true/false' (default: false); If set to true, then the points shall be drawn before the connections;
const drawMap = {
	contour: function (argline) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}
		if (points.length) {
			const baseColour = canvasParams.get("base-color")
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
		}
	},
	fill: function (argline) {
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}
		if (points.length) {
			let lastElliptic = false

			context.fillStyle = colour(canvasParams)(points, elliptics)
			context.beginPath()
			for (const key of Array.from(points.keys())) {
				if (elliptics[key][0]) {
					ellipse(points, elliptics, key)
					lastElliptic = true
					continue
				}
				if (!lastElliptic || arrows[key][0]) line(points, key)
			}
			context.closePath()
			context.fill()
		}
	},
	clear: (argline) => {
		const background = canvasParams.get("background")
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}
		if (points.length)
			return drawReplaceBackground("contour")(background)(points, arrows, elliptics)
	},
	erase: (argline) => {
		const background = canvasParams.get("background")
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}
		if (points.length)
			return drawReplaceBackground("fill")(background)(points, arrows, elliptics)
	},
	"stroke-text": function (argline) {
		document.fonts.ready.then(() => {
			const [text, font, point] = argline
			const lastColour = context.strokeStyle
			context.strokeStyle = (point && point[2]) || canvasParams.get("base-color")
			// ! defaults ['default-font', same as 'fill-text'];
			context.font = font
			// ? create a 'default-point' parameter (one that is used when the required 'point' parameter is ommited?); A default of the parameter is [0, 0];
			context.strokeText(text, ...(point || [0, 0]).slice(0, 2))
			context.strokeStyle = lastColour
		})
	},
	"fill-text": function (argline) {
		document.fonts.ready.then(() => {
			const [text, font, point] = argline
			const lastColour = context.strokeStyle
			context.fillStyle = (point && point[2]) || canvasParams.get("base-color")
			// todo: add the defaults [as a parameter];
			context.font = font
			// ? create a 'default-point' parameter (one that is used when the required 'point' parameter is ommited?); A default of the parameter is [0, 0];
			context.fillText(text, ...(point || [0, 0]).slice(0, 2))
			context.fillStyle = lastColour
		})
	},
	"font-load": async function (argline) {
		const [fontName, fontUrl] = argline
		await loadFont(fontName, fontUrl, files(fontFiles))
	}
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
	if (canvasParams.get("draw-points")) {
		const [size, shape] = ["point-size", "point-shape"].map(canvasParams.get)
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
	if (primitive) {
		const { command, argline } = primitive
		drawMap[command](argline)
	}
}
export function clear() {
	context.reset()
}
