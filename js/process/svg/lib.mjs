import { ellipseData, toDegrees } from "../../lib/math.mjs"
import { currpair } from "../../lib/lib.mjs"

export const arcData = (points, elliptics, i) => ({
	...(() => {
		const {
			radius,
			rotationAngle: angle,
			nextPoint
		} = ellipseData(
			currpair(points, i),
			elliptics[i][1],
			elliptics[i][3],
			elliptics[i][4],
			true
		)
		return {
			radius,
			angle: toDegrees(angle),
			nextPoint
		}
	})(),
	// ! THESE TWO ARE SUPPOSED TO BE THE SUBSTITUTES FOR 'isCenterAbove/isCenterBelow/isCenterLeft/isCenterRight' + 'isAbove/isBelow'!!!
	largeArc: true,
	sweep: true
})

export const xy = (point) => point.slice(0, 2)
