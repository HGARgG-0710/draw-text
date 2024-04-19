// * The mathematics, refactored (what little there is...).

// ^ idea: generalize these interfaces in math-expressions.js - a way to use them as an alternative to plain Argument signature...;

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it into a separate package?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
export function toRadians(degs) {
	return (degs / 180) * Math.PI
}

export function toDegrees(rads) {
	return (rads * 180) / Math.PI
}

// ! complete...
export function ellipseData(points, angle, startAngle, endAngle) {
	const radAngs = [startAngle, endAngle].map((x, i) =>
		toRadians(x != null ? x : 360 ** i - !i)
	)

	angle %= 360
	const first = points[0]

	// ! proper alias for the '[0, 1]'
	const [x, y] = [0, 1].map((i) => points.map((x) => x[i]))
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	const [isFirstLeft, isFirstAbove] = [dx >= 0, 0 < dy]

	const isAlternate = angle > 270

	const dxGreater = Math.abs(dx) > Math.abs(dy)
	const isCenterBelow = dxGreater && !isAlternate
	const isCenterAbove = dxGreater && isAlternate
	const isCenterRight = !dxGreater && !isAlternate

	const centerAngle = (isAlternate ? (x) => x - 270 : (x) => x)(angle)

	const fs = ["cos", "sin"]
	const diagLen = Math.sqrt(dx ** 2 + dy ** 2)
	const _radius = fs.map((x) => Math[x]).map((f) => diagLen * f(toRadians(centerAngle)))
	const radius = _radius[0]

	// const term = [
	// 	(d) => Math.acos(Math.abs(d) / diagLen) - toRadians(centerAngle),
	// 	(d) => toRadians(90) - (toRadians(centerAngle) - Math.acos(Math.abs(d) / diagLen))
	// ]
	// 	.map((f) => [dx, dy].map((d) => f(d)))
	// 	.flat()

	const term = [
		Math.acos(Math.abs(dx) / diagLen) - toRadians(centerAngle),
		Math.acos(Math.abs(dy) / diagLen) - toRadians(centerAngle),
		toRadians(90) - (toRadians(centerAngle) - Math.acos(Math.abs(dx) / diagLen)),
		toRadians(90) - (toRadians(centerAngle) - Math.acos(Math.abs(dy) / diagLen)),
		toRadians(90) - (toRadians(centerAngle) + Math.acos(Math.abs(dx) / diagLen))
	]

	console.log("first above?")
	console.log(isFirstAbove)
	console.log("first left?")
	console.log(isFirstLeft)

	console.log("above?")
	console.log(isCenterAbove)
	console.log("below?")
	console.log(isCenterBelow)
	console.log("right?")
	console.log(isCenterRight)

	console.log("is dx?")
	console.log(!!dx)
	console.log("is dy?")
	console.log(!!dy)

	console.log("\n\n")

	const getCenter = (
		first,
		isCenterAbove,
		isCenterBelow,
		isCenterRight,
		isFirstLeft,
		isFirstAbove,
		radius,
		term
	) =>
		first.map(
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
					Math[fs[(i + (isCenterAbove || isCenterBelow)) % 2]](
						term[
							isCenterAbove
								? isFirstAbove
									? 2
									: isFirstLeft
									? 1
									: 4
								: isCenterBelow
								? isFirstAbove
									? 1
									: 2
								: isCenterRight // ! simplify, later...
								? isFirstLeft
									? 0
									: 3
								: isFirstLeft
								? 3
								: 0
						]
					)
		)

	const center = getCenter(
		first,
		isCenterAbove,
		isCenterBelow,
		isCenterRight,
		isFirstLeft,
		isFirstAbove,
		radius,
		term
	)

	// ! looks like this is still quite unfinished...;
	const sinval = Math.abs(center[1] - first[1]) / radius
	const rotationBase = Math.asin(sinval)
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
			centerAngle <= 45
				? // rotationBase <= toRadians(90)
				  /* isFirstLeft ^ isFirstAbove */
				  // * check (incomplete... ALL 176)
				  isCenterAbove
					? isFirstLeft && isFirstAbove
						? 0
						: isFirstLeft
						? 1
						: isFirstAbove
						? 1
						: 0
					: // * check (incomplete... ALL 176)
					isCenterBelow
					? isFirstLeft && isFirstAbove
						? 0
						: isFirstLeft
						? 1
						: isFirstAbove
						? 1
						: 0
					: // * check (incomplete, ALL 176)
					isCenterRight
					? isFirstAbove && isFirstLeft
						? 0
						: isFirstLeft
						? 1
						: isFirstAbove
						? 1
						: 0
					: // * check (incomplete, ALL 176)
					isFirstAbove && isFirstLeft
					? 0
					: isFirstLeft
					? 1
					: isFirstAbove
					? 1
					: 0
				: // * check (incomplete, ALL 176, do for dx, dy...)
				isCenterAbove
				? isFirstLeft && isFirstAbove
					? 1
					: isFirstLeft
					? 0
					: isFirstAbove
					? 0
					: 1
				: // * check (incomplete... ALL 176)
				isCenterBelow
				? isFirstLeft && isFirstAbove
					? 1
					: isFirstLeft
					? 0
					: isFirstAbove
					? 0
					: 1
				: // * check (incomplete.. all 176)
				isCenterRight
				? isFirstAbove && isFirstLeft
					? 1
					: isFirstLeft
					? 0
					: isFirstAbove
					? 0
					: 1
				: // * check (incomplete.. all 176)
				isFirstAbove && isFirstLeft
				? 1
				: isFirstLeft
				? 0
				: isFirstAbove
				? 0
				: 1
		](rotationBase)

	// ! finish it... [not rotated, assumes wrong coordinate system, add the appropriate transformations...];
	// * For rotation - use the rotation matrix...;
	const nextPoint = _radius.map(
		(r, i) => r * Math[fs[r[0] >= r[1] ? i : +!i]](radAngs[1])
	)

	return {
		center,
		radius: _radius,
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
