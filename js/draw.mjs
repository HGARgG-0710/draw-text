const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")

context.imageSmoothingEnabled = false

function drawPoint(x, y) {
	context.fillRect(x, y, 1, 1)
}

function drawBackground(colour) {
	const prevFill = context.fillStyle
	context.fillStyle = colour
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = prevFill
}

// ! Later expand the 'primitives' to not only work with NGons...;
export default function draw(primitive, background) {
	if (primitive) {
		const { command } = primitive
		primitive = primitive.argline

		// ^ NOTE: currently, no curves are supported, so the otherwise meaningful 'instanceof' check is dropped for sanity reasons.
		// ? Use a map of function instead of a 'switch'?
		switch (command) {
			// ! REWRITE THE 'contour' and 'fill' COMMANDS - THEY MUST ALLOW FOR 'elliptic' CONNECTIONS [and the 'fill' must permit a king of non-monotonic colouring, think about how to implement it...]; 
			case "contour":
				context.globalCompositeOperation = "source-over"
				for (const key of Array.from(primitive.points.keys())) {
					context.beginPath()
					// * For contour...
					context.strokeStyle = primitive.connections[key][1] || "#000000"
					context.moveTo(...primitive.points[key])
					if (primitive.connections[key][0])
						context.lineTo(
							...primitive.points[(key + 1) % primitive.points.length]
						)
					// * For point...
					context.fillStyle = primitive.points[key][2] || "#000000"
					drawPoint(...primitive.points[key])
					context.closePath()
					context.stroke()
				}
				break
			// ? As one is going to add the 'arc' here as well as to the 'contour', why not allow for setting colours to the edges? [same with '-'-connecting?]
			case "fill":
				if (primitive.length) {
					context.globalCompositeOperation = "source-over"
					// ! take all these ugly zeros out of usage... replace with string.repeat();
					context.fillStyle =
						primitive
							.map((x) => x[2])
							.reduce(
								(acc, curr) => (acc ? acc : curr ? curr : null),
								null
							) || "#000000"
					context.beginPath()
					context.moveTo(...primitive[0])
					// ? Question: is this "moveTo" thing needed (because one believes not..., seen places that did without it); See if so - should be a good optimization for complex pictures...;
					for (const key of Array.from(primitive.keys()))
						context.lineTo(...primitive[(key + 1) % primitive.length])
					context.closePath()
					context.fill()
				}
				break
			// ! refactor these two... (create a special 'lib.mjs' file, as always, for this...);
			case "clear":
				return draw(
					{
						command: "contour",
						argline: {
							points: primitive.argline.points.map((x) => {
								x[2] = background
								return x
							}),
							connections: {
								arrows: primitive.argline.arrows.map((arrow) => {
									arrow[1] = background
									return arrow
								}),
								elliptics: primitive.argline.connections.elliptics.map(
									(elliptic) => {
										elliptic[3] = background
										return elliptic
									}
								)
							}
						}
					},
					background
				)
			case "erase":
				return draw(
					{
						command: "fill",
						argline: {
							points: primitive.argline.points.map((x) => {
								x[2] = background
								return x
							}),
							connections: {
								arrows: primitive.argline.connections.arrows.map((x) => {
									x[1] = background
									return x
								}),
								elliptics: primitive.argline.elliptics.map((x) => {
									x[3] = background
									return x
								})
							}
						}
					},
					background
				)
			case "background":
				drawBackground(primitive)
				return primitive
		}
	}
}
export function clear() {
	context.reset()
}
