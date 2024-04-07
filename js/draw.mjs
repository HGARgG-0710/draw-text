import { black } from "./colors.mjs"
import params from "./params.mjs"

const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

context.imageSmoothingEnabled = false

function line(points, key) {
	context.lineTo(...points[(key + 1) % points.length])
}

// ^ idea: Add the appropriate 'casual' geometric functions/identities to future releases of 'math-expressions.js' (things like Pythagoreas, work with angles, trignonometry - this and other stuff...):
function ellipse(points, elliptics, key) {
	const pair = [0, 1].map((i) => points[(key + i) % points.length])
	const [x, y] = [0, 1].map((i) => pair.map((x) => x[i]))
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	const preCenterAngle = elliptics[key][1] % 360

	const [startAngle, endAngle] = elliptics[key].slice(2, 4)
	const [isFirstLeft, isFirstAbove] = [dx >= 0, 0 < dy]

	// ! Definition is flawed. Fix; [Requires more bloody branching AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH!]
	// ! FIX THOSE! They are supposed to be incompatible;
	// ! CLEAN UP ALL THAT MESS - refactor using '.map's + fix the ternary sequence for 'center';
	// ? Should one, though? This is good for semantics. Makes code far more intuitive...
	// * How about the following - if this works, then (initially) oneself commits as-is, then cleans up.
	const isCenterBelow = Math.abs(dx) > Math.abs(dy) && preCenterAngle < 90
	const isCenterAbove = Math.abs(dx) > Math.abs(dy) && preCenterAngle > 270
	const isCenterRight = Math.abs(dy) > Math.abs(dx) && preCenterAngle < 90
	const isCenterLeft = Math.abs(dy) > Math.abs(dx) && preCenterAngle > 270

	const centerAngle = (isCenterAbove ? (x) => x - 270 : (x) => x)(preCenterAngle)

	const diagLen = Math.sqrt(dx ** 2 + dy ** 2)
	const radius = ["cos", "sin"]
		.map((x) => Math[x])
		.map((f) => diagLen * f(toRadians(centerAngle)))
	// ! leave alone for now... Center's still fucked.
	const rotationAngle = 0 /* toRadians(90 - centerAngle) + Math.acos(dx / diagLen) */

	console.log("Above:")
	console.log(isCenterAbove)
	console.log("Below:")
	console.log(isCenterBelow)
	console.log("Left:")
	console.log(isCenterLeft)
	console.log("Right:")
	console.log(isCenterRight)
	console.log()
	console.log("left center angle?")
	console.log(isFirstLeft)
	console.log("first above?")
	console.log(isFirstAbove)

	const center = [
		[x, "cos"],
		[y, "sin"]
	].map(([z, f], i) => {
		return (
			z[+(isCenterAbove || isCenterBelow ? !isFirstLeft : !isFirstAbove)] +
			(-1) ** (isCenterAbove ? i : isCenterRight ? 0 : isCenterBelow ? 0 : !i) *
				radius[+(isCenterAbove || isCenterBelow ? !isFirstLeft : !isFirstAbove)] *
				Math[f](
					toRadians((isFirstAbove ? (x) => x : (x) => 90 - x)(centerAngle)) +
						Math.acos(Math.abs(dx / diagLen))
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

export default function draw(primitive) {
	const background = params.get("background")[0]
	if (primitive) {
		const { command } = primitive

		const { argline } = primitive
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}

		// ! Use a map of functions instead of a 'switch';
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
				return draw({
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
				})
			case "erase":
				return draw({
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
				})
		}
	}
}
export function clear() {
	context.reset()
}
