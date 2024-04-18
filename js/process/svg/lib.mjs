import { ellipseData } from "../../lib/math.mjs"
import { currpair } from "../../lib/lib.mjs"

export const arcData = (points, elliptics, i) => ({
	...(() => {
		const {
			radius,
			rotationAngle: angle,
			nextPoint
		} = ellipseData(currpair(points, i), elliptics[i][1], ...elliptics[i].slice(3, 5))
		return {
			radius,
			angle,
			nextPoint
		}
	})(),
	// ! THESE TWO ARE SUPPOSED TO BE THE SUBSTITUTES FOR 'isCenterAbove/isCenterBelow/isCenterLeft/isCenterRight' + 'isAbove/isBelow'!!!
	largeArc: true,
	sweep: false
})

export const xy = (point) => point.slice(0, 2)
