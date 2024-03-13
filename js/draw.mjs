function drawPoint(x, y) {
	document.querySelector("canvas").getContext("2d").fillRect(x, y, 1, 1)
}

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive) {
	const { command } = primitive
	primitive = primitive.argline

	const canvas = document.querySelector("canvas")
	const context = canvas.getContext("2d")

	// ^ NOTE: currently, no curves are supported, so the otherwise meaningful 'instanceof' check is dropped for sanity reasons.
	// ? Use a map of function instead of a 'switch'?
	switch (command) {
		case "contour":
			context.globalCompositeOperation = "source-over"
			// ? Create separate Path2D's here, then do each one in a loop?
			// ! THE 'fillStyle' is to be generalized!!! [to a particular colour for each one point of a polygon..., and for each arrow];
			for (const key of Array.from(primitive.points.keys())) {
				context.beginPath()
				// * For point...
				context.strokeStyle = "#00000"
				context.moveTo(...primitive.points[key])
				drawPoint(...primitive.points[key])
				// * For polygon...
				context.fillStyle = "#00000"
				if (primitive.connected[key])
					context.lineTo(
						...primitive.points[(key + 1) % primitive.points.length]
					)
				context.closePath()
				context.stroke()
			}
			break
		case "fill":
			if (primitive.length) {
				context.globalCompositeOperation = "source-over"
				context.fillStyle = "#00000"
				context.beginPath()
				context.moveTo(...primitive[0])
				// ? Question: is this "moveTo" thing needed (because one believes not..., seen places that did without it); See if so - should be a good optimization for complex pictures...;
				for (const key of Array.from(primitive.keys())) {
					context.lineTo(...primitive[(key + 1) % primitive.length])
				}
				context.closePath()
				context.fill()
			}
			break
		case "clear":
			context.globalCompositeOperation = "source-atop"
			// ! MUST BE THE SAME AS THE background-color of the context!
			context.strokeStyle = ""
			break
		case "erase":
			break
		case "background":
			break
	}
}
export function clear() {
	document.querySelector("canvas").getContext("2d").reset()
}
