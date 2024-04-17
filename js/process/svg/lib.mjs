import { ellipseData } from "../../lib/math.mjs"

export const arcData = (elliptics, i) => ({
	...(() =>
		({
			radius,
			rotationAngle: angle,
			nextPoint
		} = ellipseData(currpair(i), elliptics[i][1], ...elliptics[i].slice(3, 5))))(),
	// ! THESE TWO ARE SUPPOSED TO BE THE SUBSTITUTES FOR 'isCenterAbove/isCenterBelow/isCenterLeft/isCenterRight' + 'isAbove/isBelow'!!!
	largeArc: true,
	sweep: false
})

export const xy = (point) => point.slice(0, 2)