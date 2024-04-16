// * The mathematics, refactored (what little there is...).

// ^ idea: generalize these interfaces in math-expressions.js - a way to use them as an alternative to plain Argument signature...;

// ^ idea: add a 'units' module to 'math-expression.mjs' (or make it into a separate package?) - functions for general unit conversion, efficient means of internal unit-data-record-keeping;
export function toRadians(degs) {
	return (degs / 180) * Math.PI
}

// ! complete...
export function ellipseData(points, angle, startAngle, endAngle) {
	const radAngs = [startAngle, endAngle].map((x, i) =>
		toRadians(x != null ? x : 360 ** i)
	)

	angle %= 360
	const first = points[0]

	// ! proper alias for the '[0, 1]'
	const [x, y] = [0, 1].map((i) => points.map((x) => x[i]))
	const [dx, dy] = [x, y].map((p) => p[1] - p[0])

	const [isFirstLeft, isFirstAbove] = [dx >= 0, 0 < dy]

	const isAlternate = angle > 270

	const isCenterBelow = Math.abs(dx) > Math.abs(dy) && !isAlternate
	const isCenterAbove = Math.abs(dx) > Math.abs(dy) && isAlternate
	const isCenterRight = Math.abs(dy) > Math.abs(dx) && !isAlternate

	const centerAngle = (isAlternate ? (x) => x - 270 : (x) => x)(angle)

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
				Math[fs[(i + (isCenterAbove || isCenterBelow)) % 2]](
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
	
	

	return {
		center,
		radius: _radius,
		rotationAngle,
		// ! finish it...
		nextPoint: [],
		startAngle: radAngs[0],
		endAngle: radAngs[1]
	}
}
