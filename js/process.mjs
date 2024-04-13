import draw from "./draw.mjs"
import { regexps } from "./parser.mjs"
import { context } from "./draw.mjs"
import { black } from "./colors.mjs"
import params from "./params.mjs"

export const vars = new Map()

export const parseSingle = (x) =>
	(x instanceof Array
		? (x) => x.map(parseSingle)
		: typeof x === "boolean"
		? (x) => x
		: !isNaN(x)
		? Number
		: vars.has(x)
		? (y) => parseSingle(vars.get(y))
		: (text) => text.match(regexps.colorarg)[0] || black)(x)

function substitute(expression) {
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

export default function process(expression, ...past) {
	const { command, argline } = expression
	switch (command) {
		case "set-param":
			const paramName = argline[0]
			if (params.has(paramName)) {
				const param = params.get(paramName)
				const newParamValue = parseSingle(argline[1])
				if (param[1](newParamValue)) {
					param[0] = newParamValue
					if (typeof param[2] === "function")
						param[2].call(context, newParamValue)
				}
			}
			break
		case "variable":
			vars.set(argline[0], parseSingle(argline[1]))
			break
		default:
			// TODO: allow [in parser] all the params to be commands themselves (to keep compatibility with old syntax...):
			if (params.has(command))
				return process({
					command: "set-param",
					argline: [command].concat(argline)
				})
			return draw(substitute(expression), ...past)
	}
}
