import { NGon } from "./primitives.mjs"

function drawPoint(x, y) {
	document.querySelector("canvas").getContext("2d").fillRect(x, y, 1, 1)
}

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive) {
	const canvas = document.querySelector("canvas")
	const context = canvas.getContext("2d")
	if (primitive instanceof NGon) {
		const keys = Array.from(primitive.points.keys())
		// ! THE 'fillStyle' is to be generalized!!!
		context.beginPath()
		for (const key of keys) {
			context.fillStyle = "#00000"
			drawPoint(...primitive.points[key])
			context.moveTo(...primitive.points[key])
			if (primitive.connected[key])
				context.lineTo(...primitive.points[(key + 1) % keys.length])
		}
		context.closePath()	
		context.stroke()
	}
}
export function clear() {
	document.querySelector("canvas").getContext("2d").reset()
}
