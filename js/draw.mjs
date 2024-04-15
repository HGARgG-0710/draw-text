// ? Rename this module into 'drawcanvas'? That is due to the fact that it (essentially), implements the canvas interface. The website, then, would only use the API as a special case...;
// ! continue refactoring...;

import params from "./params.mjs"

export const canvas = document.querySelector("canvas")
export const context = canvas.getContext("2d")
context.globalCompositeOperation = "source-over"

// ! added the point-drawing parameter definition; All that is left is to test them out...;
// ! PROBLEM - no way to add round angles to 'fill' contours currently (or so it seems) - test, then do something about it...;
const drawMap = {
	contour: function (points, arrows, elliptics) {
		for (const key of Array.from(points.keys())) {
			context.fillStyle = points[key][2] || params.get("base-color")[0]
			drawPoint(...points[key])

			context.beginPath()
			// * For contour...
			context.strokeStyle = arrows[key][1] || elliptics[key][2] || context.fillStyle
			if (arrows[key][0]) {
				context.moveTo(...points[key])
				line(points, key)
			} else if (elliptics[key][0]) ellipse(points, elliptics, key)
			// * For point...
			context.stroke()
		}
	},
	fill: function (points, _arrows, elliptics) {
		context.fillStyle =
			points
				.map((x, i) => (x[2] ? x[2] : elliptics[i][2]))
				.reduce((acc, curr) => (acc ? acc : curr ? curr : null), null) ||
			params.get("base-color")[0]
		context.beginPath()
		for (const key of Array.from(points.keys())) {
			if (elliptics[key][0]) {
				ellipse(points, elliptics, key)
				continue
			}
			line(points, key)
		}
		context.closePath()
		context.fill()
	},
	// ! refactor these two;
	clear: (points, arrows, elliptics, background) =>
		draw({
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
		}),
	erase: (points, arrows, elliptics, background) =>
		draw({
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

context.imageSmoothingEnabled = false

function line(points, key) {
	context.lineTo(...points[(key + 1) % points.length])
}

// ^ idea: Add the appropriate 'casual' geometric functions/identities to future releases of 'math-expressions.js' (things like Pythagoreas, work with angles, trignonometry - this and other stuff...):
function ellipse(points, elliptics, key) {
	// ! alias the '[0, 1]' properly...;
	const pair = [0, 1].map((i) => points[(key + i) % points.length])
	const [x, y] = [0, 1].map((i) => pair.map((x) => x[i]))
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	const preCenterAngle = elliptics[key][1] % 360

	const angles = elliptics[key].slice(3, 5)
	const [startAngle, endAngle] = [angles[0] || 0, angles[1] || 360].map(toRadians)
	const [isFirstLeft, isFirstAbove] = [dx >= 0, 0 < dy]

	const isAlternate = preCenterAngle > 270

	const isCenterBelow = Math.abs(dx) > Math.abs(dy) && !isAlternate
	const isCenterAbove = Math.abs(dx) > Math.abs(dy) && isAlternate
	const isCenterRight = Math.abs(dy) > Math.abs(dx) && !isAlternate

	const centerAngle = (isAlternate ? (x) => x - 270 : (x) => x)(preCenterAngle)

	const fs = ["cos", "sin"]
	const diagLen = Math.sqrt(dx ** 2 + dy ** 2)
	const _radius = fs.map((x) => Math[x]).map((f) => diagLen * f(toRadians(centerAngle)))
	const radius = _radius[0]

	const term = [
		(d) => Math.acos(Math.abs(d) / diagLen) - toRadians(centerAngle),
		(d) => toRadians(90) - (toRadians(centerAngle) - Math.acos(Math.abs(d) / diagLen))
	]
		.map((f) => [dx, dy].map((d) => f(d)))
		.flat()

	const first = pair[0]

	const center = first.map(
		(x, i) =>
			x +
			(-1) **
				(isCenterAbove
					? isFirstLeft
						? i
						: 1
					: isCenterBelow
					? isFirstLeft
						? 0
						: !i
					: isCenterRight
					? isFirstAbove
						? 0
						: i
					: isFirstAbove
					? !i
					: 1) *
				radius *
				Math[
					fs[
						isCenterAbove
							? +!i
							: isCenterRight
							? +!i
							: isCenterBelow
							? i
							: i /* (i + (isCenterAbove || isCenterBelow)) % 2 */
					]
				](
					term[
						isCenterAbove
							? isFirstAbove
								? 2
								: isFirstLeft
								? 1
								: 3
							: isCenterBelow
							? isFirstAbove
								? 1
								: 2
							: isCenterRight
							? isFirstLeft
								? 0
								: 3
							: isFirstLeft
							? 3
							: isFirstAbove
							? 1
							: 0
					]
				)
	)

	const rotationBase = Math.asin(Math.abs(center[1] - first[1]) / radius)
	const rotationTransform = [(x) => x, (x) => toRadians(360) - x]

	const rotationAngle =
		rotationTransform[
			isCenterAbove
				? +isFirstLeft
				: isCenterBelow
				? +!isFirstLeft
				: isCenterRight
				? +!isFirstAbove
				: +isFirstAbove
		](rotationBase)

	context.ellipse(...center, ..._radius, rotationAngle, startAngle, endAngle)
}

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it into a separate package?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
function toRadians(degs) {
	return (degs / 180) * Math.PI
}

function drawPoint(x, y) {
	if (params.get("draw-points")[0]) {
		const path = new Path2D()
		const size = params.get("point-size")[0]
		switch (params.get("point-shape")[0]) {
			case "circ":
				path.arc(x, y, size)
				break
			case "rect":
				const [delta, side] = [(x, y) => x / y, (x, y) => x * y].map((f) =>
					f(size, Math.sqrt(2))
				)
				context.fillRect(...[x, y].map((t) => t - delta), Array(2).fill(side))
		}
		context.fill(path)
	}
}

export default function draw(primitive) {
	const background = params.get("background")[0]
	if (primitive) {
		const { command } = primitive

		const { argline } = primitive
		const { points, connections } = argline
		const { arrows, elliptics } = connections ? connections : {}

		if (points.length) drawMap[command](points, arrows, elliptics, background)
	}
}
export function clear() {
	context.reset()
}
