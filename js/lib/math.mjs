// * The mathematics, refactored (what little there is...).

// ^ idea: generalize these interfaces in math-expressions.js - a way to use them as an alternative to plain Argument signature...;

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it into a separate package?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
export function toRadians(degs) {
	return (degs / 180) * Math.PI
}

export function toDegrees(rads) {
	return (rads * 180) / Math.PI
}

// ^ idea: add all the functions from here to the future planned modules/packages related to geometry...;
// ! complete...
export function ellipseData(points, angle, startAngle, endAngle) {
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

	// const term = [
	// 	(d) => Math.acos(Math.abs(d) / diagLen) - toRadians(centerAngle),
	// 	(d) => toRadians(90) - (toRadians(centerAngle) - Math.acos(Math.abs(d) / diagLen))
	// ]
	// 	.map((f) => [dx, dy].map((d) => f(d)))
	// 	.flat()

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

	console.log("first above?")
	console.log(isFirstAbove(points))
	console.log("first left?")
	console.log(isFirstLeft(points))

	console.log("above?")
	console.log(isCenterAbove(points, angle))
	console.log("below?")
	console.log(isCenterBelow(points, angle))
	console.log("right?")
	console.log(isCenterRight(points, angle))

	console.log("is dx?")
	console.log(!!dx(points))
	console.log("is dy?")
	console.log(!!dy(points))

	console.log("\n\n")
	console.log(dx(points))

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
	const sinval = (center[1] - first(points)[1]) / radius(points, angle)
	const rotationBase = Math.asin(Math.abs(sinval))
	const rotationTransform = [(x) => x, (x) => toRadians(360) - x]

	// ! STRANGE SHIT STARTS TO HAPPEN AT BORDERS - 'dx=0' and 'dy=0'; CHECK FOR THOSE AS WELL!
	// ! PROOOOOOOBBBBLLLLEEEEEMMMM... - EACH AND EVERY SINGLE FUCKING ONE ___HAS___ ITS OWN 'SPECIAL POINT' AFTER WHICH THE FIRST (currently <= 45) __STOPS__ WORKING PERFECTLY! AND THEY'RE BLOODY DIFFERENT... [some are above 45, others - under...] NEED TO FIND THEM ALL...;
	// * they have to be figured out individually and STORED IN AN ARRAY... [try to find out the deviation (see if it scales - if not, then stick with '45')];
	// ? find a precise solution for it sometime later? [YES IT DOES! Seems like, it's looking for the 'high/low' point of 'rotationBase' - everything after it goes into the second set, while all before - in the first ONE JUST HAS TO FIND THEM OUT!];

	// % Curr todo list:
	// 		1. Find all the bounds at which the things 'break' into the other set of values (start with 45, then elminate 1-by-1 each of the 16 different cases, then - change values see if scales);
	// 		2. Check the values at 'dx=0' and 'dy=0', how each one of 16 ellipses behaves... (they ought to either be all the same, or different... refactor accordingly);
	const rotationAngle =
		rotationTransform[
			// ^ CONCLUSION: for testing, one must first express all the constants in code via functions...;
			centerAngle(angle) <= 45
				? /* (
				isCenterAbove
					? isFirstLeft && isFirstAbove
						? 0
						: isFirstAbove
						? 0
						: isFirstLeft
						? 0
						: 0
					: isCenterBelow
					? isFirstLeft && isFirstAbove
						? 0
						: isFirstAbove
						? 0
						: isFirstLeft
						? 0
						: 0
					: isCenterRight
					? isFirstLeft && isFirstAbove
						? 0
						: isFirstAbove
						? 0
						: isFirstLeft
						? 0
						: 0
					: isFirstLeft && isFirstAbove
					? 0
					: isFirstAbove
					? 0
					: isFirstLeft
					? 0
					: 0
			) */
				  /* isFirstLeft ^ isFirstAbove */
				  // * check (incomplete... ALL 176)
				  isCenterAbove(points, angle)
					? isFirstLeft(points) && isFirstAbove(points)
						? 0
						: isFirstLeft(points)
						? 1
						: isFirstAbove(points)
						? 1
						: 0
					: // * check (incomplete... ALL 176)
					isCenterBelow(points, angle)
					? isFirstLeft(points) && isFirstAbove(points)
						? 0
						: isFirstLeft(points)
						? 1
						: isFirstAbove(points)
						? 1
						: 0
					: // * check (incomplete, ALL 176)
					isCenterRight(points, angle)
					? isFirstAbove(points) && isFirstLeft(points)
						? 0
						: isFirstLeft(points)
						? 1
						: isFirstAbove(points)
						? 1
						: 0
					: // * check (incomplete, ALL 176)
					isFirstAbove(points) && isFirstLeft(points)
					? 0
					: isFirstLeft(points)
					? 1
					: isFirstAbove(points)
					? 1
					: 0
				: // * check (incomplete, ALL 176, do for dx, dy...)
				isCenterAbove(points, angle)
				? isFirstLeft(points) && isFirstAbove(points)
					? 1
					: isFirstLeft(points)
					? 0
					: isFirstAbove(points)
					? 0
					: 1
				: // * check (incomplete... ALL 176)
				isCenterBelow(points, angle)
				? isFirstLeft(points) && isFirstAbove(points)
					? 1
					: isFirstLeft(points)
					? 0
					: isFirstAbove(points)
					? 0
					: 1
				: // * check (incomplete.. all 176)
				isCenterRight(points, angle)
				? isFirstAbove(points) && isFirstLeft(points)
					? 1
					: isFirstLeft(points)
					? 0
					: isFirstAbove(points)
					? 0
					: 1
				: // * check (incomplete.. all 176)
				isFirstAbove(points) && isFirstLeft(points)
				? 1
				: isFirstLeft(points)
				? 0
				: isFirstAbove(points)
				? 0
				: 1
		](rotationBase)

	console.log(toDegrees(sinval))
	console.log(toDegrees(rotationBase))

	// ! finish it... [not rotated, assumes wrong coordinate system, add the appropriate transformations...];
	// * For rotation - use the rotation matrix...;
	const nextPoint = _radius(points, angle).map(
		(r, i) => r * Math[fs[r[0] >= r[1] ? i : +!i]](radAngs[1])
	)

	return {
		center,
		radius: _radius(points, angle),
		rotationAngle,
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
