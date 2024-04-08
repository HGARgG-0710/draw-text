// ! Refactor [much]!!!

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
	// ! Okay, the maths collapsed successfully. Apparently, self has forgotten that between two points only two different right-angle triangles can go [follows from that between two points only a single line exists];
	const pair = [0, 1].map((i) => points[(key + i) % points.length])
	const [x, y] = [0, 1].map((i) => pair.map((x) => x[i]))
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	const preCenterAngle = elliptics[key][1] % 360

	// ! CREATE DEFAULTS FOR THESE TWO! [would allow a very compact way of setting the thing...];
	// ? Possibly, change places the 'color' argument in an ellipse and these two angles?
	const [startAngle, endAngle] = elliptics[key].slice(2, 4)
	const [isFirstLeft, isFirstAbove] = [dx >= 0, 0 < dy]

	const isAlternate = preCenterAngle > 270

	// ! Definition is flawed. Fix; [Requires more bloody branching AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH!]
	// ! FIX THOSE! They are supposed to be incompatible;
	// ! CLEAN UP ALL THAT MESS - refactor using '.map's + fix the ternary sequence for 'center';
	// ? Should one, though? This is good for semantics. Makes code far more intuitive...
	// * How about the following - if this works, then (initially) oneself commits as-is, then cleans up.
	const isCenterBelow = Math.abs(dx) > Math.abs(dy) && !isAlternate
	const isCenterAbove = Math.abs(dx) > Math.abs(dy) && isAlternate
	const isCenterRight = Math.abs(dy) > Math.abs(dx) && !isAlternate
	const isCenterLeft = Math.abs(dy) > Math.abs(dx) && isAlternate

	const centerAngle = (isAlternate ? (x) => x - 270 : (x) => x)(preCenterAngle)

	const diagLen = Math.sqrt(dx ** 2 + dy ** 2)
	const _radius = ["cos", "sin"]
		.map((x) => Math[x])
		.map((f) => diagLen * f(toRadians(centerAngle)))
	const radius = _radius[0]
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

	const term = [
		toRadians(90) - (toRadians(centerAngle) - Math.acos(dx / diagLen)),
		Math.acos(dy / diagLen) - toRadians(centerAngle),
		toRadians(90) - (toRadians(centerAngle) - Math.acos(dy / diagLen)),
		Math.acos(dx / diagLen) - toRadians(centerAngle)
	]
	const first = pair[0]

	const fs = ["cos", "sin"]

	// const _center = isCenterAbove
	// 	? isFirstLeft && isCenterAbove
	// 		? first.map((x, i) => x + (-1) ** i * radius * Math[fs[+!i]](term[0]))
	// 		: isFirstLeft
	// 		? first.map((x, i) => x + (-1) ** i * radius * Math[fs[+!i]](term[1]))
	// 		: isFirstAbove
	// 		? first.map((x, i) => x + (-1) ** 1 * radius * Math[fs[+!i]](term[0]))
	// 		: first.map((x, i) => x + (-1) ** 1 * radius * Math[fs[+!i]](term[2]))
	// 	: isCenterBelow ? 
	// 		isFirstAbove && isFirstLeft ? 
	// 		: 
	// 	: []

	// ! inomplete - fix;
	// ! 16 distinct cases - horrid. make look good [refactor conditionals into a single conditionaless expression with bool-Number arithmetic...]
	const center = isCenterAbove
		? isFirstLeft && isFirstAbove
			? [
					first[0] + radius * Math.sin(term[0]),
					first[1] - radius * Math.cos(term[0])
			  ]
			: isFirstLeft
			? [
					first[0] + radius * Math.sin(term[1]),
					first[1] - radius * Math.cos(term[1])
			  ]
			: isFirstAbove
			? [
					first[0] - radius * Math.sin(term[0]),
					first[1] - radius * Math.cos(term[0])
			  ]
			: [
					first[0] - radius * Math.sin(term[2]),
					first[1] - radius * Math.cos(term[2])
			  ]
		: isCenterBelow
		? isFirstLeft && isFirstAbove
			? [
					first[0] + radius * Math.sin(term[1]),
					first[1] + radius * Math.cos(term[1])
			  ]
			: isFirstLeft
			? [
					first[0] + radius * Math.sin(term[0]),
					first[1] + radius * Math.cos(term[0])
			  ]
			: isFirstAbove
			? [
					first[0] - radius * Math.sin(term[1]),
					first[1] + radius * Math.cos(term[1])
			  ]
			: [
					first[0] - radius * Math.sin(term[0]),
					first[1] + radius * Math.cos(term[0])
			  ]
		: isCenterRight
		? isFirstLeft && isFirstAbove
			? [
					first[0] + radius * Math.cos(term[3]),
					first[1] + radius * Math.sin(term[3])
			  ]
			: isFirstLeft
			? [
					first[0] + radius * Math.cos(term[3]),
					first[1] - radius * Math.sin(term[3])
			  ]
			: isFirstAbove
			? [
					first[0] + radius * Math.cos(term[2]),
					first[1] + radius * Math.sin(term[2])
			  ]
			: [
					first[0] + radius * Math.cos(term[2]),
					first[1] - radius * Math.sin(term[2])
			  ]
		: isFirstLeft && isFirstAbove
		? [first[0] - radius * Math.cos(term[2]), first[1] + radius * Math.sin(term[2])]
		: isFirstLeft
		? [first[0] - radius * Math.cos(term[2]), first[1] - radius * Math.sin(term[2])]
		: isFirstAbove
		? [first[0] - radius * Math.cos(term[1]), first[1] + radius * Math.sin(term[1])]
		: [first[0] - radius * Math.cos(term[3]), first[1] - radius * Math.cos(term[3])]

	// ? Is order (indexation) of 'radius' correct (and general) here? Check...
	context.ellipse(
		...center,
		..._radius,
		rotationAngle,
		...[startAngle, endAngle].map(toRadians)
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
