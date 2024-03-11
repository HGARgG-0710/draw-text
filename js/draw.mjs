import { NGon } from "./primitives.mjs"

function drawPoint(x, y) {
	document.querySelector("canvas").getContext("2d").fillRect(x, y, 1, 1)
}

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive) {
	const canvas = document.querySelector("canvas")
	const context = canvas.getContext("2d")
	// ? Create separate Path2D's here, then do each one in a loop?
	if (primitive instanceof NGon) {
		const keys = Array.from(primitive.points.keys())
		// ! THE 'fillStyle' is to be generalized!!! [to a particular colour for each one point of a polygon..., and for each arrow]; 
		for (const key of keys) {
			// * For point...
			context.strokeStyle = "#00000"	
			context.beginPath()
			drawPoint(...primitive.points[key])	
			// * For polygon...
			context.strokeStyle = "#00000"	
			context.moveTo(...primitive.points[key])
			if (primitive.connected[key])
				context.lineTo(...primitive.points[(key + 1) % keys.length])	
			context.closePath()		
			context.stroke()
		}
	}
}
export function clear() {
	document.querySelector("canvas").getContext("2d").reset()
}
