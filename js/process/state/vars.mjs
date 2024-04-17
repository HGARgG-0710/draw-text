import { parseSingle } from "../../parser/types.mjs"

export const vars = new Map()

export function substitute(expression) {
	if (expression instanceof Array) return expression.map(parseSingle)
	const { argline, connections, points, arrows, elliptics } = expression
	if (elliptics)
		return {
			arrows: substitute(arrows),
			elliptics: substitute(elliptics)
		}
	if (connections)
		return {
			points: substitute(points),
			connections: substitute(connections)
		}
	return { ...expression, argline: substitute(argline) }
}
