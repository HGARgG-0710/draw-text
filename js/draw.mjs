export const black = `#${"0".repeat(3)}`

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
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	// ^ idea: Add the appropriate 'casual' geometric functions/identities to future releases of 'math-expressions.js' (things like Pythagoreas, work with angles, trignonometry - this and other stuff...):
	// ! PROBLEM WITH MATHS - somewhy draws the wrong ellipse - problem with (mainly) 'center' and (possibly, also) 'radius';
	const preCenterAngle = elliptics[key][1] % 360
	// ! not used... fix;
	const isCenterAbove = preCenterAngle > 270
	const centerAngle = (isCenterAbove ? (x) => x - 270 : (x) => x)(preCenterAngle)

	const [startAngle, endAngle] = elliptics[key].slice(2, 4)
	const [isLeftCenterAngle, isAbove] = [dx >= 0, 0 <= dy]
	console.log(isAbove)

	// ? What the hell is this even?
	// const controlCenterAngle =
	// 	() %
	// 	360

	const diagLen = Math.sqrt(dx ** 2 + dy ** 2)
	const radius = ["cos", "sin"]
		.map((x) => Math[x])
		.map((f) => diagLen * f(toRadians(centerAngle)))
	// ! Hogwash. Fix. 
	const rotationAngle =
		toRadians((isCenterAbove ? 270 : 0) + centerAngle) -
		Math.asin(Math.abs(dy / diagLen))

	const center = [
		[x, "cos"],
		[y, "sin"]
	].map(([z, f], i) => {
		return (
			z[+!isLeftCenterAngle] +
			(-1) ** i *
				radius[+!isLeftCenterAngle] *
				Math[f](
					toRadians(
						(!isLeftCenterAngle ? (x) => 90 - x : (x) => x)(centerAngle)
					) - Math.acos(Math.abs(dx / diagLen))
				)
		)
	})


	// ? Is order (indexation) of 'radius' correct (and general) here? Check...
	context.ellipse(
		...center,
		...radius,
		rotationAngle,
		toRadians(startAngle),
		toRadians(endAngle)
	)

	// ! DEBUG CODE...
	return [center, pair, radius]
}

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it a separate module?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
function toRadians(degs) {
	return (degs / 180) * Math.PI
}

function drawPoint(x, y) {
	// ! DELETE ! DEBUG CODE!
	const fillStyle = context.fillStyle
	context.fillStyle = "#ff0000"
	context.fillRect(x, y, 3, 3)
	context.fillStyle = fillStyle
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

		const { argline } = primitive
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}

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
					let [center, pair] = []
					context.fillStyle =
						points
							.map((x, i) => (x[2] ? x[2] : elliptics[i][4]))
							.reduce(
								(acc, curr) => (acc ? acc : curr ? curr : null),
								null
							) || black
					context.beginPath()
					for (const key of Array.from(points.keys())) {
						if (elliptics[key][0]) {
							// ! DEBUG CODE!!!
							;[center, pair] = ellipse(points, elliptics, key)
							continue
						}
						line(points, key)
					}
					context.closePath()
					context.fill()
					// ! DEBUG CODE!!
					drawPoint(...center)
					drawPoint(...pair[0])
					drawPoint(...pair[1])
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
				drawBackground(argline)
				return argline
		}
	}
}
export function clear() {
	context.reset()
}
