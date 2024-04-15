// TODO: later, refactor this parser using the parser library of one's own...;
// ? This 'findSegments' is a good addition to the library in question...; Also - consider index-passing-based parsing (one, where one of inputs is an index, and so is one of outputs...);
// ? Add a 'regex' module to it?

import { and, or, occurences, global, begin, end, nlookbehind } from "../regex.mjs"
import params from "../params.mjs"

// ! Fix that somehow... [a proper typesystem is in order, less chaotic];
export const validityMap = {
	background: "colorarg",
	variable: "vararg",
	"line-width": "vardecimal",
	// ? make those into a variable too? [define arithmetic on those finite sets too? Isomorphic to the additive group of Z_n, where 'n' is their size?]
	"line-cap": "caparg",
	contour: "argseq",
	fill: "argseq",
	erase: "argseq",
	clear: "argseq",
	"draw-points": "boolarg",
	"point-size": "vardecimal",
	"point-shape": "pointshapearg",
	"base-color": "varcolor"
}

// ^ IDEA: create a module for working with regexp tables [note: they could be used to construct the 'parser-type-recognition-tables' for parsers created by one of self's currently developed libraries...];
// TODO: refactor these... [lots of repetition...];

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
	hyphen: /-/
}

// ! later, use some properly defined alias space instead of something particular like this (math-expressions.js);
function r(...args) {
	return args.map((x) => reg[x])
}

const regfun = {
	variable: (...x) => or(...r(...x, "varname")),
	brackets: (...x) => and(reg.opbrack, ...x, reg.clbrack)
}

// ? More semantic subdivisions? Some of these things are types/command-arguments, while some are mere tokens. There should be separation...; 
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
	// TODO: refactor these... [a 'finiteArrayRegExp']
	caparg: end(begin(or(/b/, /r/, /s/))),
	boolarg: end(begin(or(/true/, /false/))),
	pointshapearg: end(begin(or(/rect/, /circ/)))
}

regexps.triple = global(
	and(
		nlookbehind(and(...r("hyphen", "space"))),
		regfun.brackets(
			reg.space,
			regexps.vardecimal,
			...r("space", "comma", "space"),
			regexps.vardecimal,
			occurences(0, 1)(and(...r("comma", "space"), regexps.varcolor))
		)
	)
)

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
		regexps.triple,
		reg.space,
		occurences(0, 1)(or(...["elliptic", "colorarrow"].map((x) => regexps[x])))
	)
)

// ^ IDEA: add a special category of commands - 'set'-commands; They'd be defined DIRECTLY by the 'params', and each have a given signature; This would free one from having to add them manually into the parser...;
export const [connectionCommands, singleCommands, pairCommands] = [
	["contour", "fill", "clear", "erase"],
	[],
	["variable", "set-param"]
].map((x) => new Set(x))

Array.from(params.keys()).forEach((x) => singleCommands.add(x))

export const commandList = [connectionCommands, singleCommands, pairCommands]
	.map((x) => Array.from(x))
	.flat()
