// * The mathematics, refactored (what little there is...).

// ^ idea: generalize these interfaces in math-expressions.js - a way to use them as an alternative to plain Argument signature...;

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it into a separate package?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
export function toRadians(degs) {
	return (degs / 180) * Math.PI
}

export function toDegrees(rads) {
	return (rads * 180) / Math.PI
}

export function ellipseCenterAnglePoint(radius, angle, center) {
	const coeff = (-1) ** (Math.PI / 2 < angle < (3 / 2) * Math.PI)
	const pyth = Math.sqrt(
		(Math.sin(angle) * radius[0]) ** 2 + (Math.cos(angle) * radius[1]) ** 2
	)
	return ["sin", "cos"].map(
		(fname, i) =>
			(coeff * radius[0] * radius[1] * Math[fname](angle)) / pyth + center[i]
	)
}

// ! PROBLEM [1] - THIS IS NOT THE CORRECT ROTATION! ONE MUST INSTEAD ROTATE THE "AXIS"! SAME AS WITH THE CANVAS ROTATION!
// ! PROBLEM [2] - DOES SVG SUPPORT THAT KIND OF ROTATION IN PRINCIPLE EVEN? IF NOT, ONE'LL HAVE TO ALTER CODE FOR IT VERY SERIOUSLY...;
export function rotateClockwise(point, angle) {
	return [
		Math.cos(angle) * point[0] - Math.sin(angle) * point[1],
		Math.sin(angle) * point[0] + Math.cos(angle) * point[1]
	]
}

// ^ idea: add all the functions from here to the future planned modules/packages related to geometry...;
// ! PROBLEM - THE isSVG parameter! It's only a temp, to allow at least SOME ellipses to work with SVG currently...; 
export function ellipseData(points, angle, startAngle, endAngle, isSVG = false) {
	const radAngs = [startAngle, endAngle].map((x, i) =>
		toRadians(x != null ? x : 360 ** i - !i)
	)

	angle %= 360
	const first = (points) => points[0]

	// ! proper alias for the '[0, 1]'
	const [x, y] = [0, 1].map((i) => (points) => points.map((x) => x[i]))
	const d = (c) => c[1] - c[0]
	const [dx, dy] = [x, y].map((c) => (points) => d(c(points)))

	const [isFirstLeft, isFirstAbove] = [
		(points) => dx(points) >= 0,
		(points) => 0 < dy(points)
	]

	const isAlternate = (angle) => angle > 270

	const dxGreater = (points) => Math.abs(dx(points)) > Math.abs(dy(points))
	const isCenterBelow = (points, angle) => dxGreater(points) && !isAlternate(angle)
	const isCenterAbove = (points, angle) => dxGreater(points) && isAlternate(angle)
	const isCenterRight = (points, angle) => !dxGreater(points) && !isAlternate(angle)

	const centerAngle = (angle) => (isAlternate(angle) ? (x) => x - 270 : (x) => x)(angle)

	const fs = ["cos", "sin"]
	const diagLen = (points) => Math.sqrt(dx(points) ** 2 + dy(points) ** 2)
	const _radius = (points, angle) =>
		fs
			.map((x) => Math[x])
			.map((f) => diagLen(points) * f(toRadians(centerAngle(angle))))
	const radius = (points, angle) => first(_radius(points, angle))

	const term = (points, angle) => [
		Math.acos(Math.abs(dx(points)) / diagLen(points)) - toRadians(centerAngle(angle)),
		Math.acos(Math.abs(dy(points)) / diagLen(points)) - toRadians(centerAngle(angle)),
		toRadians(90) -
			(toRadians(centerAngle(angle)) -
				Math.acos(Math.abs(dx(points)) / diagLen(points))),
		toRadians(90) -
			(toRadians(centerAngle(angle)) -
				Math.acos(Math.abs(dy(points)) / diagLen(points))),
		toRadians(90) -
			(toRadians(centerAngle(angle)) +
				Math.acos(Math.abs(dx(points)) / diagLen(points)))
	]

	const getCenter = (points, angle) =>
		first(points).map(
			(x, i) =>
				x +
				(-1) **
					(isCenterAbove(points, angle)
						? isFirstLeft(points)
							? i
							: 1
						: isCenterBelow(points, angle)
						? isFirstLeft(points)
							? 0
							: !i
						: isCenterRight(points, angle)
						? isFirstAbove(points)
							? 0
							: i
						: isFirstAbove(points)
						? !i
						: 1) *
					radius(points, angle) *
					Math[
						fs[
							(i +
								(isCenterAbove(points, angle) ||
									isCenterBelow(points, angle))) %
								2
						]
					](
						// ! Attempt at generalization:
						// (dxGreater ^ isAlternate ? (x) => x : (x) => x.reverse())(
						// 	[3, 0].map((x) => (x + 2 * dxGreater) % 4)
						// )[+!(dxGreater ? isFirstAbove : isFirstLeft)]
						term(points, angle)[
							isCenterAbove(points, angle)
								? isFirstAbove(points)
									? 2
									: isFirstLeft(points)
									? 1
									: 4 // ? is this not supposed to be not-here? [symmetry says it's not... Probably a 'fix' of the '45-degrees' issue... RETURN THE 'temp' to the way it should be...];
								: isCenterBelow(points, angle)
								? isFirstAbove(points)
									? 1
									: 2
								: isCenterRight(points, angle) // ! simplify, later...
								? isFirstLeft(points)
									? 0
									: 3
								: isFirstLeft(points)
								? 3
								: 0
						]
					)
		)

	const center = getCenter(points, angle)

	// ! looks like this is still quite unfinished...;
	const sinval = (points, angle) =>
		(getCenter(points, angle)[1] - first(points)[1]) / radius(points, angle)
	const rotationBase = (points, angle) => Math.asin(Math.abs(sinval(points, angle)))

	// ! note: the check with looking at the 'next one' is also (not entirely) correct. In cases when it overflows through '90deg', there's a (very) small chance that the value in question will actually get into the wrong branch, because the larger portion of the 'added' value will go into that initial [89; 90], rather than the reversed [90; 89] (it won't be visible, but still - a tiny thing to fix...)
	// ! NOTE: this '+ 0.1' thing WON'T GENERALLY WORK with the non-integer values! (once self adds the floats, also add the corresponding 'size check' - to either revert the condition of checking in this case, or (less general) - decrease the power of 10 below -1 here...)
	const rotationConditional = [
		(points, angle) =>
			rotationBase(points, angle) < rotationBase(points, angle + 0.1),
		(points, angle) => sinval(points, angle) < 0,
		(points, angle) =>
			rotationBase(points, angle) > rotationBase(points, angle + 0.1),
		(points, angle) => sinval(points, angle) > 0
	].map((f) => f(points, angle))
	const rotationTransform = [(x) => x, (x) => toRadians(360) - x]
	const la = [(x, y) => x ^ y, (x, y) => +(x === y)]

	// TODO: REFACTORING -- make those (rotationAngle) into separate functions - properties of the 'ellipse' submodule...; Then use elegantly here...

	// ? Try to replace the 'sinval(...) < 0' with 'rotationBase(...) >/< rotationBase(...)'? [Think about it...];
	const rotationAngle = rotationTransform[
		la[
			+!rotationConditional[
				isCenterAbove(points, angle)
					? 2 * isFirstAbove(points)
					: isCenterBelow(points, angle)
					? +!isFirstAbove(points)
					: isCenterRight(points, angle)
					? isFirstLeft(points) * (1 + 2 * isFirstAbove(points))
					: +!isFirstLeft(points) * (1 + 2 * isFirstAbove(points))
			]
		](...[isFirstLeft, isFirstAbove].map((f) => f(points)))
	](rotationBase(points, angle))

	// ! WRONG! fix later...; 
	const nextPoint = ellipseCenterAnglePoint(_radius(points, angle), radAngs[1], center)

	console.log(rotationAngle * !isSVG)
	console.trace()
	return {
		center,
		radius: _radius(points, angle),
		rotationAngle: rotationAngle * !isSVG,
		nextPoint,
		startAngle: radAngs[0],
		endAngle: radAngs[1]
	}
}

export function rectData(x, y, size) {
	const [delta, side] = [(x, y) => x / y, (x, y) => x * y].map((f) =>
		f(size, Math.sqrt(2))
	)
	const [height, width] = Array(2).fill(side)
	const [xleft, ytop] = [x, y].map((t) => t - delta)
	return {
		delta,
		side,
		height,
		width,
		x: xleft,
		y: ytop
	}
}
