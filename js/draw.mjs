const black = `#${"0".repeat(3)}`

const canvas = document.querySelector("canvas")
const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

context.imageSmoothingEnabled = false

function line(points, key) {
	context.lineTo(...points[(key + 1) % points.length])
}

function ellipse(points, elliptics, key) {
	const pair = [0, 1].map((i) => points[(key + i) % points.length])
	const [x, y] = [0, 1].map((i) => pair.map((x) => x[i]))
	// ^ idea: Add the appropriate 'casual' geometric functions/identities to future releases of 'math-expressions.js' (things like Pythagoreas, work with angles, trignonometry - this and other stuff...):
	// ! PROOOOOBBBLLLEEEEMMmm - DOES it or does it (the maths) not handle cases when 'alpha >= 90'? Consider that. Re-do the maths...;
	const [centerAngle, startAngle, endAngle] = elliptics[key]
		.slice(1, 3)
		.map((x) => x % 360)
	const isLeftCenterAngle = x[1] >= x[0]
	const controlCenterAngle =
		(centerAngle * (-1) ** isLeftCenterAngle + 180 + (isLeftCenterAngle ? 180 : 0)) %
		360
	const diagLen = Math.sqrt((x[1] - x[0]) ** 2 + (y[1] - y[0]) ** 2)
	const radius = ["cos", "sin"].map((x) => Math[x]).map((f) => diagLen * f(centerAngle))
	// ! CHECK FOR CORRRECTNESS!!! [probably correct only for one case of isLeftCenterAngle...];
	const rotationAngle = toRadians(
		270 + centerAngle - Math.asin((y[1] - y[0]) / diagLen)
	)
	const center = [
		[x, "sin"],
		[y, "cos"]
	].map(
		([z, f], i) =>
			z[0] +
			(-1) **
				(!i
					? [3, 0]
							.map((x) => (x + 2 * !isLeftCenterAngle) % 4)
							.includes(Math.floor(controlCenterAngle / 90))
					: 1 + (Math.floor(controlCenterAngle / 180) % 2)) *
				radius[0] *
				Math[f](
					centerAngle -
						Math.acos(Math.sqrt(diagLen ** 2 - (y[1] - y[0]) ** 2) / diagLen)
				)
	)
	// ? Is order (indexation) of 'radius' correct (and general) here? Check...
	context.ellipse(...center, ...radius, rotationAngle, startAngle, endAngle)
}

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it a separate module?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
function toRadians(degs) {
	return (degs / 180) * Math.PI
}

function drawPoint(x, y) {
	context.fillRect(x, y, 1, 1)
}

function drawBackground(colour) {
	const prevFill = context.fillStyle
	context.fillStyle = colour
	context.fillRect(0, 0, canvas.width, canvas.height)
	context.fillStyle = prevFill
}

export default function draw(primitive, background) {
	if (primitive) {
		const { command } = primitive

		const { points } = primitive
		const { arrows, elliptics } = primitive.connections
		primitive = primitive.argline

		// ? Use a map of functions instead of a 'switch'?
		switch (command) {
			case "contour":
				for (const key of Array.from(points.keys())) {
					context.beginPath()
					// * For contour...
					context.strokeStyle = arrows[key][1] || black
					context.moveTo(...points[key])
					if (arrows[key][0]) line(points, key)
					else if (elliptics[key][0]) ellipse(points, elliptics, key)
					// * For point...
					context.fillStyle = points[key][2] || black
					drawPoint(...points[key])
					context.closePath()
					context.stroke()
				}
				break
			case "fill":
				if (points.length) {
					context.fillStyle =
						points
							.map((_x, i) =>
								arrows[i][0] ? arrows[i][2] : elliptics[i][4]
							)
							.reduce(
								(acc, curr) => (acc ? acc : curr ? curr : null),
								null
							) || black
					context.beginPath()
					for (const key of Array.from(points.keys())) {
						context.moveTo(...points[key])
						if (arrows[key][0]) {
							context.lineTo(...points[(key + 1) % points.length])
							continue
						}
						if (elliptics[key][0]) ellipse(points, elliptics, key)
					}
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
					},
					background
				)
			case "erase":
				return draw(
					{
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
