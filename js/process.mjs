import draw from "./draw.mjs"
import { regexps } from "./parser.mjs"

const vars = new Map()

export const parseSingle = (x) =>
	(!isNaN(x)
		? Number
		: vars.has(x)
		? vars.get.bind(vars)
		: (text) => (text.match(regexps.colorarg) || ["#ffffff"])[0])(x)

// ? Choose a different condition for length of 'x.split(",")'?
const isPoint = (x) =>
	x[0] === "(" && x[x.length - 1] === ")" && [2, 3].includes(x.split(",").length)

const parseSemiTriples = (point) =>
	point
		.slice(1, point.length - 1)
		.split(" ")
		.join("")
		.split(",")
		.map(parseSingle)

function substitute(expression) {
	if (expression instanceof Array) return expression.map(parseSingle)
}

export default function process(expression, ...past) {
	switch (expression.type) {
		case "variable":
			vars.set(
				...expression.args
					.split("\t")
					.join(" ")
					.split(" ")
					.map((x, i) => (i && !isNaN(x) ? Number(x) : x))
			)
			break
		default:
			return draw(substitute(expression), ...past)
	}
}
