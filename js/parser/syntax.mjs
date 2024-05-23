// TODO: this division of 'syntax-parser' is very messy - the SYNTAX CHECKS and PARSING should be conducted using THE SAME API, not separate ones...;
// ? Think of how to solve the problem generally interface-wise...;

import { and, or, occurences, begin, end, nlookbehind } from "../lib/regex.mjs"
import { canvasParams } from "../process/state/params.mjs"

export const validityMap = {
	background: "colorarg",
	variable: "vararg",
	"line-width": "vardecimal",
	// ? make those into a variable too? [define arithmetic on those finite sets too? Isomorphic to the additive group of Z_n, where 'n' is their size?]
	"line-cap": "caparg",
	"line-join": "caparg",
	contour: "argseq",
	fill: "argseq",
	erase: "argseq",
	clear: "argseq",
	"draw-points": "boolarg",
	"point-size": "vardecimal",
	"point-shape": "pointshapearg",
	"base-color": "varcolor",
	"fill-text": "fontarg",
	"stroke-text": "fontarg",
	"font-load": "duostring"
}

// ^ IDEA: create a module for working with regexp tables [note: they could be used to construct the 'parser-type-recognition-tables' for parsers created by one of self's currently developed libraries...];

const reg = {
	arrow: /->/,
	space: /( |\t)*/,
	opbrack: /\(/,
	clbrack: /\)/,
	color: /#[\da-fA-F]{3,}/,
	varname: /[a-zA-Z\d_]+/,
	decimal: /[\d]+/,
	tab: /\t/,
	spacebar: / /,
	comma: /,/,
	hyphen: /-/,
	quote: /"/,
	wild: /.*/
}

// ! later, use some properly defined alias space instead of something particular like this (math-expressions.js);
function r(...args) {
	return args.map((x) => reg[x])
}

const regfun = {
	variable: (...x) => or(...r(...x, "varname")),
	brackets: (...x) => and(reg.opbrack, ...x, reg.clbrack),
	quotes: (...x) => and(reg.quote, ...x, reg.quote)
}

export function finarrre(array) {
	return or(...array.map((x) => new RegExp(x)))
}

export const regexps = {
	arrow: reg.arrow,
	vardecimal: regfun.variable("decimal"),
	varcolor: regfun.variable("color"),
	colorarrow: and(
		...r("arrow", "space"),
		occurences(0, 1)(regfun.brackets(regfun.variable("color")))
	),
	vararg: occurences(1)(
		and(
			...r("varname", "space", "spacebar", "space"),
			regfun.variable("color", "decimal")
		)
	),
	decimal: end(begin(reg.decimal)),
	// TODO: TAKE THESE FIN-ARRAYS OUT OF HERE [connect with the 'params' typesystem...];
	caparg: finarrre(["b", "r", "s"]),
	boolarg: finarrre(["true", "false"]),
	pointshapearg: finarrre(["rect", "circ"]),
	string: regfun.quotes(reg.wild)
}

regexps.triple = and(
	nlookbehind(reg.hyphen),
	regfun.brackets(
		reg.space,
		regexps.vardecimal,
		...r("space", "comma", "space"),
		regexps.vardecimal,
		occurences(0, 1)(and(...r("comma", "space"), regexps.varcolor))
	)
)

regexps.vartriple = or(reg.varname, regexps.triple)
regexps.varstring = or(reg.varname, regexps.string)

regexps.colorarg = and(reg.space, regexps.varcolor, reg.space)
regexps.colorarrowStrict = and(...r("arrow", "space"), regfun.brackets(regexps.varcolor))

regexps.elliptic = and(
	...r("hyphen", "space"),
	regfun.brackets(
		reg.space,
		regexps.vardecimal,
		reg.space,
		occurences(
			0,
			1
		)(
			and(
				...r("comma", "space"),
				regexps.varcolor,
				occurences(
					0,
					1
				)(
					and(
						...r("comma", "space"),
						regexps.vardecimal,
						occurences(0, 1)(and(...r("comma", "space"), regexps.vardecimal))
					)
				),
				reg.space
			)
		)
	)
)

regexps.argseq = occurences(
	1,
	""
)(
	and(
		reg.space,
		regexps.vartriple,
		reg.space,
		occurences(0, 1)(or(...["elliptic", "colorarrow"].map((x) => regexps[x])))
	)
)

regexps.fontarg = and(
	regexps.varstring,
	reg.space,
	regexps.varstring,
	reg.space,
	regexps.vartriple
)

regexps.duostring = and(regexps.varstring, reg.space, regexps.varstring)

// ^ IDEA: add a special category of commands - 'set'-commands; They'd be defined DIRECTLY by the 'params', and each have a given signature; This would free one from having to add them manually into the parser...;
export const [connectionCommands, singleCommands, pairCommands, fontCommands] = [
	["contour", "fill", "clear", "erase"],
	[],
	["variable", "set-param"],
	["stroke-text", "fill-text", "font-load"]
].map((x) => new Set(x))

canvasParams.list().forEach((x) => singleCommands.add(x))

export const commandList = [
	connectionCommands,
	singleCommands,
	pairCommands,
	fontCommands
]
	.map((x) => Array.from(x))
	.reduce((prev, curr) => prev.concat(curr), [])
