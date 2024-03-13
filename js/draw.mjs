const canvas = document.querySelector("canvas")

function drawPoint(x, y) {
	canvas.getContext("2d").fillRect(x, y, 1, 1)
}

function drawBackground(colour) {
	const prevFill = canvas.fillStyle
	const context = canvas.getContext("2d")
	console.log(colour)
	context.fillStyle = colour
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = prevFill
}

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive, background) {
	const { command } = primitive
	primitive = primitive.argline

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
		// ? QUESTION: rewrite 'clear' + 'erase' in terms of 'contour' + 'fill'? [Should be quite good, actually...];
		case "clear":
			context.globalCompositeOperation = "source-atop"
			context.beginPath()
			for (const key of Array.from(primitive.points.keys())) {
				context.moveTo(...primitive.points[key])
				drawPoint(...primitive.points[key])
				if (primitive.connected[key])
					context.lineTo(
						...primitive.points[(key + 1) % primitive.points.length]
					)
			}
			context.closePath()
			context.strokeStyle = background
			context.stroke()
			return background
		case "erase":
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
		case "background":
			drawBackground(primitive)
			return primitive
	}
}
export function clear() {
	document.querySelector("canvas").getContext("2d").reset()
}
