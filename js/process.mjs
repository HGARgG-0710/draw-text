import draw from "./draw.mjs"
import { regexps } from "./parser.mjs"

const vars = new Map()

export const parseSingle = (x) =>
	(typeof x === "boolean"
		? (x) => x
		: !isNaN(x)
		? Number
		: vars.has(x)
		? (y) => parseSingle(vars.get(y))
		: (text) => (text.match(regexps.colorarg) || ["#ffffff"])[0])(x)

function substitute(expression) {
	if (expression instanceof Array)
		return expression.map((triple) => triple.map(parseSingle))
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

export default function process(expression, ...past) {
	switch (expression.command) {
		case "variable":
			const { argline } = expression
			vars.set(argline[0], parseSingle(argline[1]))
			break
		case "background":
			return draw(expression, ...past)
		default:
			return draw(substitute(expression), ...past)
	}
}
